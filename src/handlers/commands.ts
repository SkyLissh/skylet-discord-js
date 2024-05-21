import fs from "fs";
import path from "path";

import type { Client } from "discord.js";

import { text, variable } from "@/theme";
import type { SlashCommand } from "@/types";

export default async (client: Client) => {
  const slashCmdsDir = path.join(import.meta.dirname, "../commands");

  const files = await fs.promises.readdir(slashCmdsDir);

  for (const file of files) {
    const { default: cmd }: { default: SlashCommand } = await import(
      `${slashCmdsDir}/${file}`
    );
    client.slashCommands.set(cmd.command.name, cmd);
  }

  console.log(
    `${text("🔥 Successfully loaded")} ${variable(client.slashCommands.size)} ${text("slash command(s)")}`
  );
};
