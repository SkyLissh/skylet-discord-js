import fs from "fs";
import path from "path";

import { generateDependencyReport } from "@discordjs/voice";
import { Client, Collection, GatewayIntentBits } from "discord.js";

const { Guilds, MessageContent, GuildMessages, GuildVoiceStates } = GatewayIntentBits;
const client = new Client({
  intents: [Guilds, MessageContent, GuildMessages, GuildVoiceStates],
});

client.slashCommands = new Collection();
client.cooldowns = new Collection();
client.tasks = new Collection();

const handleDir = path.join(import.meta.dirname, "./handlers");
fs.readdirSync(handleDir).forEach((handler) => {
  import(`${handleDir}/${handler}`).then((m) => m.default(client));
});

console.log(generateDependencyReport());

client.login(process.env.TOKEN);
