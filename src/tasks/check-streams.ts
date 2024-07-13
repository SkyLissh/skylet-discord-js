import { type TextChannel } from "discord.js";

import type { Task } from "@/types";

import { useStreamEmbed } from "@/functions/embeds";
import { useTwitchGame, useTwitchStream, useTwitchUser } from "@/functions/twitch";

const channelId = "844345187819847701";
let latTick = false;

const task: Task = {
  name: "check-streams",
  cronTime: "*/5 * * * *",
  execute: async (client) => {
    const stream = await useTwitchStream("skylissh");

    if (!stream && latTick) {
      latTick = false;
      return;
    }
    if (!stream) return;
    if (stream && latTick) return;

    const user = await useTwitchUser("skylissh");
    if (!user) return;

    const game = await useTwitchGame(stream.game_id);
    if (!game) return;

    const channel = client.channels.cache.get(channelId);
    if (!channel || !channel.isTextBased()) return;

    (channel as TextChannel).send({
      content: `:red_circle: ${stream.user_name} is live on Twitch! @everyone`,
      embeds: [useStreamEmbed(stream, user, game)],
    });

    latTick = true;
  },
};

export default task;
