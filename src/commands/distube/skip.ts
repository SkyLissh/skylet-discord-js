import { useQueue } from "@/functions/use-queue";
import type { SlashCommand } from "@/types";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current song"),
  execute: async (interaction) => {
    const queue = useQueue(interaction);
    if (!queue) return;

    const song = await queue.skip();

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#e30026")
          .setTitle(`:track_next: Skipped! Now playing ${song.name}`)
          .setURL(song.url!)
          .setAuthor({
            name: song.uploader.name!,
            url: song.uploader.url!,
          })
          .setImage(song.thumbnail!)
          .setFooter({ text: `Duration: ${song.formattedDuration}` }),
      ],
    });
  },
};

export default command;
