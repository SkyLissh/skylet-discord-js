import { globby } from "globby";
import path from "path";
import { pathToFileURL } from "url";

import type { Client } from "discord.js";

import { logger } from "~/logger";
import type { MelodiEvent } from "~/types";

export default async (client: Client) => {
  const melodiEventsDir = path.join(import.meta.dirname, "../events/melodi");
  const files = await globby(["**/*.{ts,js}"], {
    cwd: melodiEventsDir,
    absolute: true,
    gitignore: true,
    ignore: ["**/*.d.ts"],
  });

  for (const file of files) {
    const { default: event } = (await import(pathToFileURL(file).href)) as {
      default: MelodiEvent;
    };

    client.melodi.on(event.name, (...args: unknown[]) =>
      event.execute(client, ...args).catch(() => {
        logger.error(`🎵 Failed to execute melodi event ${event.name}`);
      })
    );

    logger.info(`🎵 Successfully loaded melodi event ${event.name}`);
  }
};
