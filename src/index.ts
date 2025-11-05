import fs from "fs";
import path from "path";

import type { Client } from "discord.js";

import { client } from "./client";
import { env } from "./env";

const handleDir = path.join(import.meta.dirname, "./handlers");

for (const handler of fs.readdirSync(handleDir)) {
  const handlerPath = path.join(handleDir, handler);
  const fileUrl = new URL(`file://${handlerPath.replace(/\\/g, "/")}`).href;
  import(fileUrl).then(
    (m: { default: (client: Client) => void }) => m.default(client),
    (e) => console.error(e)
  );
}

await client.login(env.DISCORD_TOKEN);
