import { SlashCommandBuilder } from "discord.js";

import { getQueue } from "~/functions/get-queue";
import type { SlashCommand } from "~/types";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Change the volume of the music")
    .addIntegerOption((option) =>
      option
        .setName("volume")
        .setDescription("Volume level (0-100)")
        .setMinValue(0)
        .setMaxValue(100)
        .setRequired(true)
    ),
  execute: async (interaction) => {
    const queue = getQueue(interaction);
    if (!queue) return;

    const volume = interaction.options.getInteger("volume", true);
    queue.setVolume(volume);

    interaction.reply({
      content: `Volume set to ${volume}%`,
      flags: "Ephemeral",
    });
  },
};

export default command;
