import dotenv from "dotenv";

import { REST } from "@discordjs/rest";
import { Routes } from "discord.js";

import { err, text, variable } from "@/theme";

dotenv.config();

const deleteCmds = async () => {
  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
  const route =
    process.env.NODE_ENV === "development"
      ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
      : Routes.applicationCommands(process.env.CLIENT_ID);

  try {
    const res = await rest.delete(route, {
      body: [],
    });

    console.log(
      `${text("🚀 Successfully deleted")} ${variable((res as unknown[]).length)} ${text("slash command(s)")}`
    );
  } catch (e) {
    console.log(err(e));
  }
};

await deleteCmds();
