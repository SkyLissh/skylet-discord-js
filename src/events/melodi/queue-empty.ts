import type { Client } from "discord.js";
import { EmbedBuilder } from "discord.js";

import type { MelodiEvent } from "~/types";

const event: MelodiEvent = {
  name: "queueEmpty",
  execute: async (client: Client, guildId: string) => {
    const guild = await client.guilds.cache.get(guildId);
    if (!guild) return;

    const channel = guild.members.me?.voice.channel;
    if (!channel) return;

    channel.send({
      embeds: [
        new EmbedBuilder().setColor("#ff9900").setDescription("📤 Queue is now empty"),
      ],
    });
  },
};

export default event;
