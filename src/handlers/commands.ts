import fs from "fs";
import path from "path";

import type { Client } from "discord.js";

import { logger } from "@/logger";
import type { SlashCommand } from "@/types";

export default async (client: Client) => {
  const slashCmdsDir = path.join(import.meta.dirname, "../commands");

  const files = await fs.promises.readdir(slashCmdsDir, { recursive: true });

  for (const file of files) {
    if (!file.endsWith(".ts")) continue;
    if (file.includes("subcommands")) continue;

    const { default: cmd }: { default: SlashCommand } = await import(
      `${slashCmdsDir}/${file}`
    );
    client.slashCommands.set(cmd.command.name, cmd);
  }

  logger.info(`🔥 Successfully loaded ${client.slashCommands.size} slash command(s)`);
};
