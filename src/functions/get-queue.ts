import type { ChatInputCommandInteraction } from "discord.js";
import type { Queue } from "distube";

export function getQueue(interaction: ChatInputCommandInteraction): Queue | undefined {
  const queue = interaction.client.distube.getQueue(interaction.guild!);
  if (queue) return queue;

  interaction.reply({
    content: "There is nothing in the queue right now.",
    flags: "Ephemeral",
  });

  return undefined;
}
