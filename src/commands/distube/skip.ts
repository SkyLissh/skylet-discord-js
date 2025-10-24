import { SlashCommandBuilder } from "discord.js";

import { getQueue } from "~/functions/get-queue";
import type { SlashCommand } from "~/types";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current song"),
  execute: async (interaction) => {
    const queue = getQueue(interaction);
    if (!queue) return;

    queue.skip();

    interaction.reply({
      content: "Skipped the current song",
      flags: "Ephemeral",
    });
  },
};

export default command;
