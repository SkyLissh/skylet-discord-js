import ytdl from "ytdl-core";

import { createAudioResource, getVoiceConnection } from "@discordjs/voice";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import { usePlayer } from "@/functions/use-player";
import type { SlashCommand } from "@/types";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays a song from YouTube")
    .addStringOption((option) =>
      option.setName("song").setDescription("URL or name of the song").setRequired(true)
    ),
  execute: async (interaction) => {
    const url = interaction.options.getString("song", true);

    const connection = getVoiceConnection(interaction.guildId!);
    if (!connection) {
      interaction.reply({
        content: "No connection found",
        ephemeral: true,
      });
      return;
    }

    const stream = ytdl(url, { filter: "audioonly" });
    const info = await ytdl.getInfo(url);

    const resource = createAudioResource(stream);

    const player = usePlayer(interaction.client, interaction.guildId!);

    connection.subscribe(player);
    player.play(resource);

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#e30026")
          .setTitle(`Playing ${info.videoDetails.title}`)
          .setURL(info.videoDetails.video_url)
          .setAuthor({
            name: info.videoDetails.author.name,
            iconURL: info.videoDetails.author.thumbnails?.[0].url,
          })
          .setImage(info.videoDetails.thumbnails[0].url)
          .setFooter({ text: "Created at" })
          .setTimestamp(Date.parse(info.videoDetails.publishDate)),
      ],
      ephemeral: true,
    });
  },
};

export default command;
