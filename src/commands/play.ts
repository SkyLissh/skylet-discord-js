import type { GuildMember } from "discord.js";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
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

    await interaction.client.distube.play(channel, url);
    const queue = await interaction.client.distube.getQueue(channel);
    if (!queue) return;

    const song = queue.songs.at(-1);
    if (!song) return;

    console.log(song.metadata);

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#e30026")
          .setTitle(`Playing ${song.name}`)
          .setURL(song.url!)
          .setAuthor({
            name: song.uploader.name!,
            url: song.uploader.url!,
          })
          .setImage(song.thumbnail!)
          .setFooter({ text: `Duration: ${song.formattedDuration}` }),
      ],
    });
  },
};

export default command;
