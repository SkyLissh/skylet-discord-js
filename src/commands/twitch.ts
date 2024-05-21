import { SlashCommandBuilder } from "discord.js";

import type { SlashCommand } from "@/types";

import { useStreamEmbed, useTwitchUserEmbed } from "@/functions/embeds";
import {
  useTwitchFollowers,
  useTwitchGame,
  useTwitchStream,
  useTwitchUser,
} from "@/functions/twitch";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("twitch")
    .setDescription("Search for a Twitch channel")
    .addStringOption((option) =>
      option
        .setName("user")
        .setDescription("Twitch username")
        .setMinLength(25)
        .setMinLength(4)
        .setRequired(true)
    ),
  execute: async (interaction) => {
    const username = interaction.options.getString("user", true);
    const stream = await useTwitchStream(username);

    const user = await useTwitchUser(username);
    if (!user) return;

    if (stream) {
      const game = await useTwitchGame(stream.game_id);
      if (!game) return;

      interaction.reply({
        embeds: [useStreamEmbed(stream, user, game)],
      });
    } else {
      const followers = await useTwitchFollowers(user.id);
      if (!followers) return;

      interaction.reply({ embeds: [useTwitchUserEmbed(user, followers)] });
    }
  },
  cooldown: 10,
};

export default command;
