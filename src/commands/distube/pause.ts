import { SlashCommandBuilder } from "discord.js";

import { useQueue } from "@/functions/use-queue";
import type { SlashCommand } from "@/types";

const command: SlashCommand = {
  command: new SlashCommandBuilder().setName("pause").setDescription("Pause the player"),
  execute(interaction) {
    const queue = useQueue(interaction);
    if (!queue) return;

    if (queue.paused) {
      queue.resume();

      interaction.reply({
        content: ":play_button: Player resumed",
        ephemeral: true,
      });
    }

    queue.pause();
    interaction.reply({
      content: ":pause_button: Paused the player",
      ephemeral: true,
    });
  },
};

export default command;
