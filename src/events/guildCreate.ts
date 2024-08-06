import type { Guild } from "discord.js";
import { Events } from "discord.js";

import { db } from "@/db";
import { guilds } from "@/db/schema/guilds";
import type { BotEvent } from "@/types.d";

const event: BotEvent = {
  name: Events.GuildCreate,
  execute: async (guild: Guild) => {
    await db.insert(guilds).values({ id: guild.id }).onConflictDoNothing();
  },
};

export default event;
