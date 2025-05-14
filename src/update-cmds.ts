import fs from "fs";
import path from "path";

import { REST } from "@discordjs/rest";
import type { SharedSlashCommand } from "discord.js";
import { Routes } from "discord.js";

import type { SlashCommand } from "@/types";
import { env } from "./env";
import { logger } from "./logger";

process.loadEnvFile();

const update = async () => {
  const commands: SharedSlashCommand[] = [];

  const files = await fs.promises.readdir(path.join(import.meta.dirname, "./commands"));

  for (const file of files) {
    const { default: cmd }: { default: SlashCommand } = await import(
      `./commands/${file}`
    );
    commands.push(cmd.command);
  }

  const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);
  const route =
    env.NODE_ENV === "development"
      ? Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID)
      : Routes.applicationCommands(env.DISCORD_CLIENT_ID);

  try {
    const res = await rest.put(route, {
      body: commands.map((c) => c.toJSON()),
    });

    logger.info(
      `🚀 Successfully created/updated ${(res as unknown[]).length} slash command(s)`
    );
  } catch (e) {
    logger.error(e);
  }
};

await update();
