import type { GuildMember } from "discord.js";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import type { SlashCommand } from "@/types";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Joins the voice channel you are in"),
  execute: async (interaction) => {
    const member = interaction.member as GuildMember;
    const channel = member.voice.channel;
    if (!channel || !channel.isVoiceBased()) return;

    interaction.client.distube.voices.join(channel);

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setThumbnail(interaction.client.user.displayAvatarURL())
          .setTitle(`Joined ${channel.name}!`),
      ],
    });
  },
};

export default command;
