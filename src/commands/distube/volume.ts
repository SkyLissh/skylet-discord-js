import { SlashCommandBuilder } from "discord.js";

import { useQueue } from "@/functions/use-queue";
import type { SlashCommand } from "@/types";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Set the volume of the player")
    .addIntegerOption((option) =>
      option.setName("volume").setDescription("The volume to set").setRequired(true)
    ),
  execute(interaction) {
    const queue = useQueue(interaction);
    if (!queue) return;

    const volume = interaction.options.getInteger("volume")!;
    if (volume < 0 || volume > 100) {
      interaction.reply({
        content: "Volume must be between 0 and 100.",
        ephemeral: true,
      });
      return;
    }

    queue.setVolume(volume);
    interaction.reply({
      content: `:loud_sound: Volume set to ${volume}%`,
      ephemeral: true,
    });
  },
};

export default command;
