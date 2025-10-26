import { Client, Collection, GatewayIntentBits } from "discord.js";
import { Melodi } from "~/melodi";

const { Guilds, MessageContent, GuildMessages, GuildVoiceStates } = GatewayIntentBits;
const client = new Client({
  intents: [Guilds, MessageContent, GuildMessages, GuildVoiceStates],
});

client.slashCommands = new Collection();
client.cooldowns = new Collection();
client.tasks = new Collection();
client.melodi = await Melodi.create(client);

export { client };
