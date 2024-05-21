import { EmbedBuilder } from "discord.js";

import { useFormatNumber } from "@/functions/use-format-number";
import type { TwitchUser } from "@/models/twitch";

export const useTwitchUserEmbed = (user: TwitchUser, followers: number) => {
  return new EmbedBuilder()
    .setTitle(`${user.display_name} is on Twitch!`)
    .setDescription(user.description)
    .setURL(`https://twitch.tv/${user.login}`)
    .setThumbnail(user.profile_image_url)
    .addFields({
      name: ":busts_in_silhouette: Followers",
      value: useFormatNumber(followers),
    })
    .addFields({ name: ":eyes: Views", value: user.view_count })
    .setFooter({ text: "Created at" })
    .setTimestamp(user.created_at)
    .setColor("#6441A4");
};
