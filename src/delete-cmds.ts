import { REST } from "@discordjs/rest";
import { Routes } from "discord.js";

import { env } from "./env";
import { logger } from "./logger";

process.loadEnvFile();

const deleteCmds = async () => {
  const rest = new REST({ version: "10" }).setToken(env.DISCORD_TOKEN);
  const route =
    env.NODE_ENV === "development"
      ? Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID)
      : Routes.applicationCommands(env.DISCORD_CLIENT_ID);

  try {
    await rest.put(route, { body: [] });

    logger.info(`🚀 Successfully deleted slash command(s)`);
  } catch (e) {
    logger.error(e);
  }
};

await deleteCmds();
