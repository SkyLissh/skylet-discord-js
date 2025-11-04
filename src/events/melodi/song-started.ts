import type { Client } from "discord.js";
import { EmbedBuilder } from "discord.js";

import { format } from "date-fns";

import type { VideoInfo } from "~/schemas/youtube/video_info";
import type { MelodiEvent } from "~/types";

const event: MelodiEvent = {
  name: "songStarted",
  execute: async (client: Client, guildId: string, song: VideoInfo) => {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;

    const channel = guild.members.me?.voice.channel;
    if (!channel) return;

    const duration = song.duration || 0;
    const formattedDuration = format(new Date(duration * 1000), "mm:ss");

    channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#e30026")
          .setDescription(
            `▶️ Now Playing: **[${song.author} - ${song.title}](${song.url_canonical})** | \`${formattedDuration}\``
          ),
      ],
    });
  },
};

export default event;
