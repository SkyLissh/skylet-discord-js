import { generateDependencyReport } from "@discordjs/voice";
import { YouTubePlugin } from "@distube/youtube";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import { DisTube } from "distube";

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

console.log(generateDependencyReport());
export { client };
