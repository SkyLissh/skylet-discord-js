import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import type { SlashCommand } from "@/types";

const command: SlashCommand = {
  command: new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!"),
  execute: async (interaction) => {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: "Pong!" })
          .setDescription(`🏓 Pong! \n 📡 Ping: ${interaction.client.ws.ping}`)
          .setColor("#2F3136"),
      ],
    });
  },
  cooldown: 5,
};

export default command;
