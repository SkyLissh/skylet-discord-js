import { SlashCommandBuilder } from "discord.js";

import type { SlashCommand } from "@/types";

import { createStreamEmbed } from "@/functions/embeds/create-stream-embed";
import { createTwitchUserEmbed } from "@/functions/embeds/create-twitch-user-embed";
import {
  fetchTwitchFollowers,
  fetchTwitchGame,
  fetchTwitchStream,
  fetchTwitchUser,
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
    const stream = await fetchTwitchStream(username);

    const user = await fetchTwitchUser(username);
    if (!user) return;

    if (stream) {
      const game = await fetchTwitchGame(stream.game_id);
      if (!game) return;

      interaction.reply({
        embeds: [createStreamEmbed(stream, user, game)],
      });
    } else {
      const followers = await fetchTwitchFollowers(user.id);
      if (!followers) return;

      interaction.reply({ embeds: [createTwitchUserEmbed(user, followers)] });
    }
  },
  cooldown: 10,
};

export default command;
