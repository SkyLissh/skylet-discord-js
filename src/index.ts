import fs from "fs";
import path from "path";

import dotenv from "dotenv";
import { WebSocket } from "ws";

import { YouTubePlugin } from "@distube/youtube";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import { DisTube } from "distube";

dotenv.config();
Object.assign(globalThis, { WebSocket });

const { Guilds, MessageContent, GuildMessages, GuildVoiceStates } = GatewayIntentBits;
const client = new Client({
  intents: [Guilds, MessageContent, GuildMessages, GuildVoiceStates],
});

client.slashCommands = new Collection();
client.cooldowns = new Collection();
client.tasks = new Collection();
client.distube = new DisTube(client, {
  emitNewSongOnly: true,
  plugins: [new YouTubePlugin()],
});

const handleDir = path.join(import.meta.dirname, "./handlers");
fs.readdirSync(handleDir).forEach((handler) => {
  import(`${handleDir}/${handler}`).then((m) => m.default(client));
});

client.login(process.env.TOKEN);
