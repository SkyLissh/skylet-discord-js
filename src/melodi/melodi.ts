import EventEmitter from "node:events";
import { Readable } from "node:stream";

import type { VoiceConnection } from "@discordjs/voice";
import {
  createAudioResource,
  entersState,
  getVoiceConnection,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import type { Client, GuildResolvable, VoiceBasedChannel } from "discord.js";

import { ClientType, Innertube, Platform, YTNodes, type Types } from "youtubei.js";

import * as v from "valibot";

import { parseYouTubeURL } from "~/functions/parse-youtube-url";
import { InvalidUrl, NoResultsFound } from "./errors";

import { logger } from "~/logger";
import type { VideoInfo } from "~/schemas/youtube/video_info";
import { Queue } from "./queue";

Platform.shim.eval = async (
  data: Types.BuildScriptResult,
  env: Record<string, Types.VMPrimative>
  // eslint-disable-next-line @typescript-eslint/require-await
) => {
  const properties = [];

  if (env.n) {
    properties.push(`n: exportedVars.nFunction("${env.n}")`);
  }

  if (env.sig) {
    properties.push(`sig: exportedVars.sigFunction("${env.sig}")`);
  }

  const code = `${data.output}\nreturn { ${properties.join(", ")} }`;

  // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
  return new Function(code)();
};

/**
 * Melodi is a Discord music player that manages audio playback across multiple guilds.
 *
 * It integrates Discord.js voice connections with YouTube Music streaming via the Innertube API.
 * Melodi handles:
 * - Per-guild song queues with independent playback control
 * - Song resolution from YouTube URLs or search queries
 * - Voice channel joining/leaving and connection management
 * - Playback control (play, pause, resume, stop, skip)
 * - Event forwarding from queues to listeners with guild context
 *
 * Each guild maintains its own queue instance, allowing simultaneous playback
 * across multiple servers. The class acts as a facade, delegating queue management
 * to Queue instances and audio streaming to the Innertube API.
 *
 * @emits songAdded - Emitted when a song is added to a guild's queue
 * @emits songStarted - Emitted when a song starts playing in a guild
 * @emits songFinished - Emitted when a song finishes playing in a guild
 * @emits queueEmpty - Emitted when a guild's queue becomes empty
 */
export class Melodi extends EventEmitter {
  client: Client;
  yt: Innertube;

  #queues = new Map<string, Queue>();

  /**
   * Creates a Melodi instance bound to the provided Discord client and YouTube integration.
   * @param client Discord client used to resolve guilds and voice connections.
   * @param yt YouTube Innertube client used for music search and streaming.
   */
  constructor(client: Client, yt: Innertube) {
    super();
    this.client = client;
    this.yt = yt;
  }

  /**
   * Retrieves the queue for the specified guild ID.
   * @param guildId ID of the guild to retrieve the queue for.
   * @returns The queue for the specified guild ID, or undefined if it doesn't exist.
   */
  getQueue(guildId: string): Queue | undefined {
    return this.#queues.get(guildId);
  }

  /**
   * Creates a new queue for the specified guild ID and voice connection.
   * @param guildId ID of the guild to create the queue for.
   * @param connection Voice connection to associate with the queue.
   * @returns The newly created queue.
   */
  #createQueue(guildId: string, connection: VoiceConnection): Queue {
    let queue = this.getQueue(guildId);

    if (queue) return queue;

    queue = new Queue(connection);
    this.#queues.set(guildId, queue);

    // Forward queue events to Melodi instance
    queue.on("songAdded", (song: VideoInfo) => {
      this.emit("songAdded", guildId, song);
    });

    queue.on("songStarted", (song: VideoInfo) => {
      this.emit("songStarted", guildId, song);
    });

    queue.on("songFinished", (song: VideoInfo) => {
      this.emit("songFinished", guildId, song);
    });

    queue.on("queueEmpty", () => {
      this.emit("queueEmpty", guildId);
    });

    queue.on("playNext", async (song: VideoInfo) => {
      try {
        const videoInfo = await this.yt.music.getInfo(song.id!);
        const stream = await videoInfo.download({ type: "audio" });
        const resource = createAudioResource(Readable.from(stream));
        queue.play(resource);
      } catch {
        queue.skip();
      }
    });

    return queue;
  }

  /**
   * Builds a Melodi instance with a freshly created Innertube client.
   * @param client Discord client used by the music controller.
   * @returns A ready-to-use Melodi instance.
   */
  static async create(client: Client) {
    logger.info("Creating Innertube instance");

    const yt = await Innertube.create({
      enable_session_cache: false,
      client_type: ClientType.WEB,
    });

    logger.info("Innertube instance created successfully");
    return new Melodi(client, yt);
  }

  /**
   * Extracts a video ID from a YouTube URL while rejecting unsupported resource types.
   * @param url YouTube video URL to parse.
   * @throws {InvalidUrl} When the URL is not recognized as a valid YouTube video.
   * @throws {PlaylistNotSupported} When the URL points to a playlist.
   * @returns The YouTube video ID.
   */
  async #getIdFromUrl(url: string) {
    // Parse YouTube URL to extract ID and type
    const urlResult = parseYouTubeURL(url);
    if (!urlResult) {
      throw new InvalidUrl(url);
    }

    const { id, type } = urlResult;

    if (type === "playlist") {
      try {
        const playlist = await this.yt.music.getPlaylist(id);
        const videos = playlist.contents;
        if (!videos) return;

        return videos
          .map((video) => {
            if (!video.is(YTNodes.MusicResponsiveListItem)) return;

            return video.id;
          })
          .filter((id): id is string => id !== undefined);
      } catch (error) {
        throw error instanceof Error ? error : new Error("Unknown error");
      }
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
    try {
      const search = await this.yt.music.search(query, { type: "all" });
      const shelf = search.contents?.firstOfType(YTNodes.MusicShelf);
      shelf?.contents?.forEach((item) => {
        logger.info(JSON.stringify(item));
      });
      const result = shelf?.contents?.[0];

      if (!result || result.item_type !== "song") {
        throw new NoResultsFound();
      }

      return result.id!;
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Failed to fetch video information");
    }
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
    if (connection) {
      connection.destroy();
    }

    const queue = this.#queues.get(guildId);
    if (!queue) return;

    queue.leave();
    this.#queues.delete(guildId);
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
        v.regex(
          /^(https?:\/\/)?(www\.|music\.)?youtube\.com\/(watch\?v=|playlist\?list=)|^(https?:\/\/)?youtu\.be\//
        )
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

    const videoId = isUrl
      ? await this.#getIdFromUrl(url)
      : await this.#getIdFromSearch(song);

    if (!videoId) {
      throw new NoResultsFound();
    }

    try {
      if (Array.isArray(videoId)) {
        logger.info(`Found ${videoId.length} video IDs`);
        const videos = await Promise.all(videoId.map((id) => this.yt.music.getInfo(id)));
        logger.info(`Found ${videos.length} videos`);

        const queue = this.#createQueue(channel.guild.id, connection);

        const songs = videos.map((video) => {
          logger.info(`Adding ${JSON.stringify(video.basic_info)} to queue`);
          return video.basic_info as VideoInfo;
        });
        queue.add(songs);
        return songs;
      } else {
        logger.info(`Found video ID: ${videoId}`);
        const videoInfo = await this.yt.music.getInfo(videoId);
        logger.info(`Adding ${JSON.stringify(videoInfo.basic_info)} to queue`);

        const queue = this.#createQueue(channel.guild.id, connection);
        queue.add(videoInfo.basic_info as VideoInfo);
        return videoInfo.basic_info;
      }
    } catch (error) {
      connection.destroy();
      throw error instanceof Error
        ? error
        : new Error("Failed to fetch video information");
    }
  }

  /**
   * Toggles playback between pause and resume for the guild's active player.
   * @param guild Guild identifier or resolvable value.
   */
  pause(guild: GuildResolvable) {
    const guildId = this.client.guilds.resolveId(guild);
    if (!guildId) return;

    this.#queues.get(guildId)?.pause();
  }

  /**
   * Resumes playback if the guild's player is currently paused.
   * @param guild Guild identifier or resolvable value.
   */
  resume(guild: GuildResolvable) {
    const guildId = this.client.guilds.resolveId(guild);
    if (!guildId) return;

    this.#queues.get(guildId)?.resume();
  }

  /**
   * Stops playback and clears the guild's active audio resource.
   * @param guild Guild identifier or resolvable value.
   */
  stop(guild: GuildResolvable) {
    const guildId = this.client.guilds.resolveId(guild);
    if (!guildId) return;

    this.#queues.get(guildId)?.stop();
  }

  /**
   * Skips the currently playing song and plays the next one in the queue.
   * @param guild Guild identifier or resolvable value.
   */
  skip(guild: GuildResolvable) {
    const guildId = this.client.guilds.resolveId(guild);
    if (!guildId) return;

    this.#queues.get(guildId)?.skip();
  }
}
