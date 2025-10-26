import { globby } from "globby";
import path from "path";
import { pathToFileURL } from "url";

import type { Client } from "discord.js";

import { logger } from "~/logger";
import type { BotEvent } from "~/types";

export default async (client: Client) => {
  const enventsDir = path.join(import.meta.dirname, "../events");
  const files = await globby(["**/*.{ts,js}"], {
    cwd: enventsDir,
    absolute: true,
    gitignore: true,
    ignore: ["**/*.d.ts"],
  });

  for (const file of files) {
    const { default: event }: { default: BotEvent } = await import(
      pathToFileURL(file).href
    );

    if (event.once) client.once(event.name, (...args) => event.execute(...args));
    else client.on(event.name, (...args) => event.execute(...args));

    logger.info(`🌠 Successfully loaded event ${event.name}`);
  }
};
