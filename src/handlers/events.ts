import fs from "fs";
import path from "path";

import type { Client } from "discord.js";

import { text, variable } from "@/theme";
import type { BotEvent } from "@/types";

export default (client: Client) => {
  const enventsDir = path.join(import.meta.dirname, "../events");

  fs.readdirSync(enventsDir).forEach(async (file) => {
    const { default: event }: { default: BotEvent } = await import(
      `${enventsDir}/${file}`
    );

    if (event.once) client.once(event.name, (...args) => event.execute(...args));
    else client.on(event.name, (...args) => event.execute(...args));

    console.log(`${text("🌠 Successfully loaded event")} ${variable(event.name)}`);
  });
};
