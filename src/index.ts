import fs from "fs";
import path from "path";

import { client } from "./client";
import { env } from "./env";

process.loadEnvFile();

const handleDir = path.join(import.meta.dirname, "./handlers");
fs.readdirSync(handleDir).forEach((handler) => {
  import(`${handleDir}/${handler}`).then((m) => m.default(client));
});

client.login(env.DISCORD_TOKEN);
