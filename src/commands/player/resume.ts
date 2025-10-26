import { SlashCommandBuilder } from "discord.js";

import type { SlashCommand } from "~/types";

const command: SlashCommand = {
  command: new SlashCommandBuilder().setName("resume").setDescription("Resume the music"),
  execute: async (interaction) => {
    interaction.client.melodi.resume(interaction.guild!);

    interaction.reply({
      content: ":arrow_forward: Resumed the music",
      flags: "Ephemeral",
    });
  },
};

export default command;
