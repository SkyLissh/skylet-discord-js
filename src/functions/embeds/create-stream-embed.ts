import { EmbedBuilder } from "discord.js";

import type { TwitchGame } from "~/schemas/twitch/twitch-game";
import type { TwitchStream } from "~/schemas/twitch/twitch-stream";
import type { TwitchUser } from "~/schemas/twitch/twitch-user";

export const createStreamEmbed = (
  stream: TwitchStream,
  user: TwitchUser,
  game: TwitchGame
) => {
  return new EmbedBuilder()
    .setAuthor({
      name: `${stream.user_name} is live on Twitch!`,
      url: `https://twitch.tv/${stream.user_login}`,
      iconURL: user.profile_image_url,
    })
    .setTitle(stream.title)
    .setURL(`https://twitch.tv/${stream.user_login}`)
    .setThumbnail(game.box_art_url)
    .setImage(stream.thumbnail_url)
    .addFields({ name: ":video_game: Playing", value: game.name })
    .addFields({ name: ":eyes: Viewers", value: stream.viewer_count })
    .setFooter({ text: "Started at" })
    .setTimestamp(stream.started_at)
    .setColor("#6441A4");
};
