import fs from "fs";
import path from "path";

import { EdgeSpeechTTS } from "@lobehub/tts";

const tts = new EdgeSpeechTTS({ locale: "es-MX" });

export const useTTS = async (text: string) => {
  const response = await tts.create({
    input: text,
    options: {
      voice: "es-ES-ElviraNeural",
    },
  });

  const mp3 = Buffer.from(await response.arrayBuffer());
  const speechFile = path.resolve(process.cwd(), "speech.mp3");

  fs.writeFileSync(speechFile, mp3);

  return speechFile;
};
