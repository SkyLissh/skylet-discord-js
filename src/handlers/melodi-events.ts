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
    const { default: event }: { default: MelodiEvent } = await import(
      pathToFileURL(file).href
    );

    client.melodi.on(event.name, (...args) => event.execute(client, ...args));

    logger.info(`🎵 Successfully loaded melodi event ${event.name}`);
  }
};
