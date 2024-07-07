import fs from "fs";
import path from "path";

import dotenv from "dotenv";

import { REST } from "@discordjs/rest";
import type { SharedSlashCommand } from "discord.js";
import { Routes } from "discord.js";

import { err, text, variable } from "@/theme";
import type { SlashCommand } from "@/types";

dotenv.config();

const update = async () => {
  const commands: SharedSlashCommand[] = [];

  const files = await fs.promises.readdir(path.join(import.meta.dirname, "./commands"));

  for (const file of files) {
    const { default: cmd }: { default: SlashCommand } = await import(
      `./commands/${file}`
    );
    commands.push(cmd.command);
  }

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
  const route =
    process.env.NODE_ENV === "development"
      ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
      : Routes.applicationCommands(process.env.CLIENT_ID);

  try {
    const res = await rest.put(route, {
      body: commands.map((c) => c.toJSON()),
    });

    console.log(
      `${text("🚀 Successfully created/updated")} ${variable((res as unknown[]).length)} ${text("slash command(s)")}`
    );
  } catch (e) {
    console.log(err(e));
  }
};

await update();
