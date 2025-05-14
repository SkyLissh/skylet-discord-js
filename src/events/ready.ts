import type { Client } from "discord.js";
import { Events } from "discord.js";

import { CronJob } from "cron";

import { logger } from "@/logger";
import type { BotEvent } from "@/types";

import { db } from "@/db";
import { guilds } from "@/db/schema/guilds";

const event: BotEvent = {
  name: Events.ClientReady,
  once: true,
  execute: async (client: Client) => {
    logger.info(`🌠 Ready! ${client.user?.username}`);

    client.tasks.forEach((task) => {
      CronJob.from({
        cronTime: task.cronTime,
        context: client,
        onTick: function () {
          task.execute(this);
        },
        start: true,
      });

      logger.info(`⏱️ Successfully started ${task.name} task`);
    });

    const savedGuilds = await db.select().from(guilds);

    const unsavedGuilds = client.guilds.cache.filter((guild) => {
      return !savedGuilds.some((g) => g.guildId === guild.id);
    });

    await db.insert(guilds).values(
      unsavedGuilds.map((guild) => ({
        guildId: guild.id,
        name: guild.name,
      }))
    );

    logger.info(`Successfully synced ${savedGuilds.length} guilds`);
  },
};

export default event;
