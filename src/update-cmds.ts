import { globby } from "globby";
import path from "path";
import { pathToFileURL } from "url";

import { REST } from "@discordjs/rest";
import type { SharedSlashCommand } from "discord.js";
import { Routes } from "discord.js";

import type { SlashCommand } from "~/types";
import { env } from "./env";
import { logger } from "./logger";

const update = async () => {
  const commands: SharedSlashCommand[] = [];

  const commandsDir = path.join(import.meta.dirname, "./commands");
  const files = await globby(["**/*.{ts,js}"], {
    cwd: commandsDir,
    absolute: true,
    gitignore: true,
    ignore: ["**/subcommands/**", "**/*.d.ts"],
  });

  for (const file of files) {
    const { default: cmd }: { default: SlashCommand } = await import(
      pathToFileURL(file).href
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
