import { globby } from "globby";
import path from "path";
import { pathToFileURL } from "url";

import type { Client } from "discord.js";

import { logger } from "~/logger";
import type { SlashCommand } from "~/types";

export default async (client: Client) => {
  const slashCmdsDir = path.join(import.meta.dirname, "../commands");

  const files = await globby(["**/*.{ts,js}"], {
    cwd: slashCmdsDir,
    absolute: true,
    gitignore: true,
    ignore: ["**/subcommands/**", "**/*.d.ts"],
  });

  for (const file of files) {
    const { default: cmd }: { default: SlashCommand } = await import(
      pathToFileURL(file).href
    );
    client.slashCommands.set(cmd.command.name, cmd);
  }

  logger.info(`🔥 Successfully loaded ${client.slashCommands.size} slash command(s)`);
};
