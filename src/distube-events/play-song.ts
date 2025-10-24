import type { DistubeEvent } from "~/types";
import { EmbedBuilder } from "discord.js";
import { Events, type Queue, type Song } from "distube";

const event: DistubeEvent = {
  name: Events.PLAY_SONG,
  execute: (queue: Queue, song: Song) => {
    queue.textChannel?.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#e30026")
          .setTitle(`Playing ${song.name}`)
          .setURL(song.url!)
          .setAuthor({
            name: song.uploader.name!,
            url: song.uploader.url!,
          })
          .setImage(song.thumbnail!)
          .setFooter({ text: `Duration: ${song.formattedDuration}` }),
      ],
    });
  },
};

export default event;
