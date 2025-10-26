import fs from "fs";
import path from "path";

import { client } from "./client";
import { env } from "./env";

const handleDir = path.join(import.meta.dirname, "./handlers");
fs.readdirSync(handleDir).forEach((handler) => {
  const handlerPath = path.join(handleDir, handler);
  const fileUrl = new URL(`file://${handlerPath.replace(/\\/g, "/")}`).href;
  import(fileUrl).then((m) => m.default(client));
});

client.login(env.DISCORD_TOKEN);
