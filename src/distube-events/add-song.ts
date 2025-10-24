import type { DistubeEvent } from "~/types";
import { EmbedBuilder } from "discord.js";
import type { Queue, Song } from "distube";
import { Events } from "distube";

const event: DistubeEvent = {
  name: Events.ADD_SONG,
  execute: (queue: Queue, song: Song) => {
    queue.textChannel?.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#e30026")
          .setTitle(`Added ${song.name} to the queue`)
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
