import fs from "fs";
import path from "path";

import type { Client } from "discord.js";

import { logger } from "@/logger";
import type { DistubeEvent } from "@/types";

export default (client: Client) => {
  const enventsDir = path.join(import.meta.dirname, "../distube-events");

  fs.readdirSync(enventsDir).forEach(async (file) => {
    const { default: event }: { default: DistubeEvent } = await import(
      `${enventsDir}/${file}`
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client.distube.on(event.name, (...args: any) => event.execute(...args));

    logger.info(`🌠 Successfully loaded event ${event.name}`);
  });
};
