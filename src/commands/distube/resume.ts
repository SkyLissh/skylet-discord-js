import { SlashCommandBuilder } from "discord.js";

import { getQueue } from "@/functions/get-queue";
import type { SlashCommand } from "@/types";

const command: SlashCommand = {
  command: new SlashCommandBuilder().setName("resume").setDescription("Resume the music"),
  execute: async (interaction) => {
    const queue = getQueue(interaction);
    if (!queue) return;

    queue.resume();

    interaction.reply({
      content: "Resumed the music",
      ephemeral: true,
    });
  },
};

export default command;
