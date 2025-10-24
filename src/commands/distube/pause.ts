import { SlashCommandBuilder } from "discord.js";

import { getQueue } from "~/functions/get-queue";
import type { SlashCommand } from "~/types";

const command: SlashCommand = {
  command: new SlashCommandBuilder().setName("pause").setDescription("Pause the player"),
  execute(interaction) {
    const queue = getQueue(interaction);
    if (!queue) return;

    if (queue.paused) {
      queue.resume();
      return interaction.reply({
        content: ":play_button: Player resumed",
        flags: "Ephemeral",
      });
    }

    queue.pause();
    return interaction.reply({
      content: ":pause_button: Paused the player",
      flags: "Ephemeral",
    });
  },
};

export default command;
