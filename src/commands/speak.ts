import fs from "fs";
import path from "path";

import { EdgeSpeechTTS } from "@lobehub/tts";

import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
} from "@discordjs/voice";
import { SlashCommandBuilder } from "discord.js";

import type { SlashCommand } from "@/types";

const tts = new EdgeSpeechTTS({ locale: "es-MX" });

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("speak")
    .setDescription("Speaks in the voice channel you are in")
    .addStringOption((option) =>
      option.setName("text").setDescription("Text to speak").setRequired(true)
    ),
  execute: async (interaction) => {
    const text = interaction.options.getString("text", true);
    const response = await tts.create({
      input: text,
      options: {
        voice: "es-ES-ElviraNeural",
      },
    });

    const mp3 = Buffer.from(await response.arrayBuffer());
    const speechFile = path.resolve(process.cwd(), "speech.mp3");

    fs.writeFileSync(speechFile, mp3);

    const connection = getVoiceConnection(interaction.guildId!);
    if (!connection) return;
    connection.configureNetworking();

    console.log(import.meta.dirname);
    const resource = createAudioResource(speechFile);
    const player = createAudioPlayer({});

    player.on(AudioPlayerStatus.Idle, () => {
      console.log("Idle");
    });
    player.on(AudioPlayerStatus.Buffering, () => {
      console.log("Buffering");
    });
    player.on(AudioPlayerStatus.Playing, () => {
      console.log("Playing");
    });
    player.on("error", console.error);

    player.play(resource);
    connection.subscribe(player);
  },
};

export default command;
