import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import type { SlashCommand } from "@/types";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leaves the voice channel you are in"),
  execute: async (interaction) => {
    interaction.client.distube.voices.leave(interaction.guild!);

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Left voice channel")
          .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setThumbnail(interaction.client.user.displayAvatarURL())
          .setColor("#6441A4"),
      ],
      ephemeral: true,
    });
  },
};

export default command;
