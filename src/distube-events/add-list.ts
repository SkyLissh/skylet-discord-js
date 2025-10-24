import type { DistubeEvent } from "~/types";
import { EmbedBuilder } from "discord.js";
import { Events, type Playlist, type Queue } from "distube";

const event: DistubeEvent = {
  name: Events.ADD_LIST,
  execute: (queue: Queue, playlist: Playlist) => {
    queue.textChannel?.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#e30026")
          .setTitle(
            `Added ${playlist.name} - ${playlist.songs.length} songs to the queue`
          )
          .setURL(playlist.url!)
          .setImage(playlist.thumbnail!)
          .setFooter({ text: `Duration: ${playlist.formattedDuration}` }),
      ],
    });
  },
};

export default event;
