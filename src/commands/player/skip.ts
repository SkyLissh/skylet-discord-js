import type { GuildMember } from "discord.js";
import { SlashCommandBuilder } from "discord.js";

import type { SlashCommand } from "~/types";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips the currently playing song"),
  execute: async (interaction) => {
    const member = interaction.member as GuildMember;
    const channel = member.voice.channel;

    if (!channel || !channel.isVoiceBased()) {
      await interaction.reply({
        content: "You need to be in a voice channel to skip songs!",
        flags: "Ephemeral",
      });
      return;
    }

    const queue = interaction.client.melodi.getQueue(interaction.guildId!);

    if (!queue) {
      await interaction.reply({
        content: "There is no song playing right now!",
        flags: "Ephemeral",
      });
      return;
    }

    interaction.client.melodi.skip(interaction.guildId!);

    await interaction.reply({
      content: "⏭️ Skipped the current song!",
    });
  },
};

export default command;
