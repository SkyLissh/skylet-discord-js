import { getVoiceConnection } from "@discordjs/voice";
import type { Client } from "discord.js";

export const useStopVoice = (client: Client, guildId: string) => {
  const connection = getVoiceConnection(guildId);
  if (!connection) return;

  const key = `player-${guildId}`;
  const player = client.players.get(key);

  player?.stop();
  connection.destroy();

  client.players.delete(key);
};
