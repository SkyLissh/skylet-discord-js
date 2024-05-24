import { createAudioResource, getVoiceConnection } from "@discordjs/voice";
import type { Message } from "discord.js";
import { Events } from "discord.js";

import { usePlayer } from "@/functions/use-player";
import { useTTS } from "@/functions/use-tts";
import type { BotEvent } from "@/types";

const event: BotEvent = {
  name: Events.MessageCreate,
  execute: async (message: Message) => {
    if (!message.member || message.author.bot) return;
    if (!message.guild) return;

    const channel = message.channel;
    if (!channel.isVoiceBased()) return;

    const connection = getVoiceConnection(message.guild.id);
    if (!connection) return;

    const speechFile = await useTTS(message.content);

    const player = usePlayer(message.client, message.guild.id);
    const resource = createAudioResource(speechFile);

    connection.subscribe(player);
    player.play(resource);
  },
};

export default event;
