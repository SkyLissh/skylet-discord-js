import { SlashCommandBuilder } from "discord.js";

import type { SlashCommand } from "~/types";

const command: SlashCommand = {
  command: new SlashCommandBuilder().setName("pause").setDescription("Pause the player"),
  execute: async (interaction) => {
    interaction.client.melodi.pause(interaction.guild!);

    await interaction.reply({
      content: ":pause_button: Paused the player",
      flags: "Ephemeral",
    });
  },
};

export default command;
