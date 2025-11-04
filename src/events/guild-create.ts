import type { Guild } from "discord.js";
import { Events } from "discord.js";
import { eq } from "drizzle-orm";

import type { BotEvent } from "~/types";

import { db } from "~/db";
import { guilds } from "~/db/schema/guilds";

import { logger } from "~/logger";

const event: BotEvent = {
  name: Events.GuildCreate,
  execute: async (guild: Guild) => {
    const existingGuild = await db
      .select()
      .from(guilds)
      .where(eq(guilds.guildId, guild.id));

    if (existingGuild.length > 0) return;

    const [inserted] = await db
      .insert(guilds)
      .values({
        guildId: guild.id,
        name: guild.name,
      })
      .returning();

    if (!inserted) return;

    logger.info(`Guild ${inserted.name} (${inserted.guildId}) added to database`);
  },
};

export default event;
