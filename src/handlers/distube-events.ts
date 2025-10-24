import { globby } from "globby";
import path from "path";
import { pathToFileURL } from "url";

import type { Client } from "discord.js";

import { logger } from "~/logger";
import type { DistubeEvent } from "~/types";

export default async (client: Client) => {
  const enventsDir = path.join(import.meta.dirname, "../distube-events");
  const files = await globby(["**/*.{ts,js}"], {
    cwd: enventsDir,
    absolute: true,
    gitignore: true,
    ignore: ["**/*.d.ts"],
  });

  for (const file of files) {
    const { default: event }: { default: DistubeEvent } = await import(
      pathToFileURL(file).href
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client.distube.on(event.name, (...args: any) => event.execute(...args));

    logger.info(`🌠 Successfully loaded event ${event.name}`);
  }
};
