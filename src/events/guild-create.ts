import type { Guild } from "discord.js";
import { Events } from "discord.js";

import type { BotEvent } from "@/types";

import { db } from "@/db";
import { guilds } from "@/db/schema/guilds";

import { logger } from "@/logger";

const event: BotEvent = {
  name: Events.GuildCreate,
  execute: async (guild: Guild) => {
    const [inserted] = await db
      .insert(guilds)
      .values({
        guildId: guild.id,
        name: guild.name,
      })
      .returning();

    logger.info(`Guild ${inserted.name} (${inserted.guildId}) added to database`);
  },
};

export default event;
