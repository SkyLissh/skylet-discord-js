import {
  AudioPlayerStatus,
  NoSubscriberBehavior,
  createAudioPlayer,
} from "@discordjs/voice";
import type { Client } from "discord.js";
import { useStopVoice } from "./use-stop-voice";

export const usePlayer = (client: Client, guildId: string) => {
  const players = client.players;
  const key = `player-${guildId}`;

  if (!players.has(key)) {
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });

    player.on(AudioPlayerStatus.AutoPaused, () => {
      console.log("AutoPaused");
      setTimeout(() => {
        useStopVoice(client, guildId);
      }, 30_000);
    });

    player.on(AudioPlayerStatus.Buffering, () => {
      console.log("Buffering");
    });

    player.on(AudioPlayerStatus.Playing, () => {
      console.log("Playing");
    });

    players.set(key, player);
  }

  return players.get(key)!;
};
