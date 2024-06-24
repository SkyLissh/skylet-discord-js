import { SlashCommandBuilder } from "discord.js";

import { useQueue } from "@/functions/use-queue";
import type { SlashCommand } from "@/types";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume the player"),
  execute: (interaction) => {
    const queue = useQueue(interaction);
    if (!queue) return;

    if (!queue.paused) {
      interaction.reply({
        content: "The player is not paused",
        ephemeral: true,
      });

      return;
    }

    queue.resume();
    interaction.reply({
      content: ":play_button: Player resumed",
      ephemeral: true,
    });
  },
};

export default command;
