import fs from "fs";
import path from "path";

import type { Client } from "discord.js";

import { logger } from "@/logger";
import type { BotEvent } from "@/types";

export default (client: Client) => {
  const enventsDir = path.join(import.meta.dirname, "../events");

  fs.readdirSync(enventsDir).forEach(async (file) => {
    const { default: event }: { default: BotEvent } = await import(
      `${enventsDir}/${file}`
    );

    if (event.once) client.once(event.name, (...args) => event.execute(...args));
    else client.on(event.name, (...args) => event.execute(...args));

    logger.info(`🌠 Successfully loaded event ${event.name}`);
  });
};
