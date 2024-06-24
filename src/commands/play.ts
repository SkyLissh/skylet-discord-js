import type { GuildMember } from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import { z } from "zod";

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

    if (z.string().url().safeParse(url).error) {
      interaction.reply({
        content: "Invalid URL",
        ephemeral: true,
      });
      return;
    }

    const member = interaction.member as GuildMember;
    const channel = member.voice.channel;
    if (!channel || !channel.isVoiceBased()) return;

    interaction.client.distube.play(channel, url);

    // interaction.reply({
    //   embeds: [
    //     new EmbedBuilder()
    //       .setColor("#e30026")
    //       .setTitle(`Playing ${info.videoDetails.title}`)
    //       .setURL(info.videoDetails.video_url)
    //       .setAuthor({
    //         name: info.videoDetails.author.name,
    //         iconURL: info.videoDetails.author.thumbnails?.[0].url,
    //       })
    //       .setImage(info.videoDetails.thumbnails[0].url)
    //       .setFooter({ text: "Created at" })
    //       .setTimestamp(Date.parse(info.videoDetails.publishDate)),
    //   ],
    // });
  },
};

export default command;
