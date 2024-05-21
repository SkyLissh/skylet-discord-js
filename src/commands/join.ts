import { VoiceConnectionStatus, entersState, joinVoiceChannel } from "@discordjs/voice";
import { EmbedBuilder, SlashCommandBuilder, type VoiceBasedChannel } from "discord.js";

import type { SlashCommand } from "@/types";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Joins the voice channel you are in"),
  execute: async (interaction) => {
    const channel = interaction.channel;
    if (!channel || !channel.isVoiceBased()) return;

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: (channel as VoiceBasedChannel).guild.id,
      adapterCreator: (channel as VoiceBasedChannel).guild.voiceAdapterCreator,
    });

    connection.on(VoiceConnectionStatus.Signalling, () => {
      console.log("Connecting...");
    });
    connection.on(VoiceConnectionStatus.Ready, () => {
      console.log("Player ready");
    });
    await entersState(connection, VoiceConnectionStatus.Signalling, 5_000);

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
