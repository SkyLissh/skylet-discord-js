import { Readable } from "node:stream";

import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  getVoiceConnection,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import type { Client, GuildResolvable, VoiceBasedChannel } from "discord.js";

import { Innertube, Platform, YTNodes, type Types } from "youtubei.js";

import * as v from "valibot";

import { parseYouTubeURL } from "~/functions/parse-youtube-url";
import { InvalidUrl, NoResultsFound, PlaylistNotSupported } from "./errors";

Platform.shim.eval = async (
  data: Types.BuildScriptResult,
  env: Record<string, Types.VMPrimative>
) => {
  const properties = [];

  if (env.n) {
    properties.push(`n: exportedVars.nFunction("${env.n}")`);
  }

  if (env.sig) {
    properties.push(`sig: exportedVars.sigFunction("${env.sig}")`);
  }

  const code = `${data.output}\nreturn { ${properties.join(", ")} }`;

  return new Function(code)();
};

export class Melodi {
  client: Client;
  yt: Innertube;

  /**
   * Creates a Melodi instance bound to the provided Discord client and YouTube integration.
   * @param client Discord client used to resolve guilds and voice connections.
   * @param yt YouTube Innertube client used for music search and streaming.
   */
  constructor(client: Client, yt: Innertube) {
    this.client = client;
    this.yt = yt;
  }

  /**
   * Builds a Melodi instance with a freshly created Innertube client.
   * @param client Discord client used by the music controller.
   * @returns A ready-to-use Melodi instance.
   */
  static async create(client: Client) {
    const yt = await Innertube.create();
    return new Melodi(client, yt);
  }

  /**
   * Extracts a video ID from a YouTube URL while rejecting unsupported resource types.
   * @param url YouTube video URL to parse.
   * @throws {InvalidUrl} When the URL is not recognized as a valid YouTube video.
   * @throws {PlaylistNotSupported} When the URL points to a playlist.
   * @returns The YouTube video ID.
   */
  #getIdFromUrl(url: string) {
    // Parse YouTube URL to extract ID and type
    const urlResult = parseYouTubeURL(url);
    if (!urlResult) {
      throw new InvalidUrl(url);
    }

    const { id, type } = urlResult;

    // TODO: Implement playlist support
    if (type === "playlist") {
      throw new PlaylistNotSupported();
    }

    return id;
  }

  /**
   * Resolves the first song result for a search query from YouTube Music.
   * @param query Text query to search for.
   * @throws {NoResultsFound} When no song result is returned.
   * @returns The YouTube video ID for the first song result.
   */
  async #getIdFromSearch(query: string) {
    const search = await this.yt.music.search(query, { type: "all" });
    const shelf = search.contents?.firstOfType(YTNodes.MusicShelf);
    const result = shelf?.contents?.[0];

    if (!result || result.item_type !== "song") {
      throw new NoResultsFound();
    }

    return result.id!;
  }

  /**
   * Ensures the bot joins the specified voice channel, reusing existing connections when possible.
   * @param channel Voice channel the bot should join.
   * @returns The voice connection for the guild.
   */
  join(channel: VoiceBasedChannel) {
    const connection = getVoiceConnection(channel.guild.id);
    if (connection) return connection;

    return joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });
  }

  /**
   * Leaves the voice channel for the provided guild if a connection exists.
   * @param guild Guild identifier or resolvable value.
   */
  leave(guild: GuildResolvable) {
    const guildId = this.client.guilds.resolveId(guild);
    if (!guildId) return;

    const connection = getVoiceConnection(guildId);
    if (!connection) return;

    connection.destroy();
  }

  /**
   * Plays or queues audio in the target voice channel, resolving song input as URL or search query.
   * @param channel Voice channel used for playback.
   * @param song YouTube URL or search terms describing the song.
   * @returns Metadata describing the streamed video.
   */
  async play(channel: VoiceBasedChannel, song: string) {
    const { success: isUrl, output: url } = v.safeParse(
      v.pipe(
        v.string(),
        v.url(),
        v.regex(/^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=/)
      ),
      song
    );

    const connection = this.join(channel);

    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 15_000);
    } catch (error) {
      connection.destroy();
      throw error instanceof Error ? error : new Error("Failed to join voice channel");
    }

    const videoId = isUrl ? this.#getIdFromUrl(url) : await this.#getIdFromSearch(song);
    const videoInfo = await this.yt.music.getInfo(videoId);

    const stream = await videoInfo.download({ type: "audio" });

    const player = createAudioPlayer();
    const resource = createAudioResource(Readable.from(stream));

    connection.subscribe(player);
    player.play(resource);

    return videoInfo.basic_info;
  }

  /**
   * Toggles playback between pause and resume for the guild's active player.
   * @param guild Guild identifier or resolvable value.
   */
  pause(guild: GuildResolvable) {
    const guildId = this.client.guilds.resolveId(guild);
    if (!guildId) return;

    const connection = getVoiceConnection(guildId);
    if (!connection) return;

    const state = connection.state;

    if (state.status !== VoiceConnectionStatus.Ready) return;

    const player = state.subscription?.player;
    if (!player) return;

    if (player.state.status === AudioPlayerStatus.Playing) {
      player.pause();
      return;
    }

    if (player.state.status === AudioPlayerStatus.Paused) {
      player.unpause();
    }
  }

  /**
   * Resumes playback if the guild's player is currently paused.
   * @param guild Guild identifier or resolvable value.
   */
  resume(guild: GuildResolvable) {
    const guildId = this.client.guilds.resolveId(guild);
    if (!guildId) return;

    const connection = getVoiceConnection(guildId);
    if (!connection) return;

    const state = connection.state;

    if (state.status !== VoiceConnectionStatus.Ready) return;

    const player = state.subscription?.player;
    if (!player) return;

    if (player.state.status === AudioPlayerStatus.Playing) return;

    if (player.state.status !== AudioPlayerStatus.Paused) return;

    player.unpause();
  }

  /**
   * Stops playback and clears the guild's active audio resource.
   * @param guild Guild identifier or resolvable value.
   */
  stop(guild: GuildResolvable) {
    const guildId = this.client.guilds.resolveId(guild);
    if (!guildId) return;

    const connection = getVoiceConnection(guildId);
    if (!connection) return;

    const state = connection.state;

    if (state.status !== VoiceConnectionStatus.Ready) return;

    const player = state.subscription?.player;
    if (!player) return;

    player.stop();
  }
}
