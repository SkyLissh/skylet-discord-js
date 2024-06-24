import fs from "fs";
import path from "path";

import type { Client } from "discord.js";

import { text, variable } from "@/theme";
import type { DistubeEvent } from "@/types";

export default (client: Client) => {
  const enventsDir = path.join(import.meta.dirname, "../distube-events");

  fs.readdirSync(enventsDir).forEach(async (file) => {
    const { default: event }: { default: DistubeEvent } = await import(
      `${enventsDir}/${file}`
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client.distube.on(event.name, (...args: any) => event.execute(...args));

    console.log(`${text("🌠 Successfully loaded event")} ${variable(event.name)}`);
  });
};
