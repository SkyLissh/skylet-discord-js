import { type TextChannel } from "discord.js";
import { eq } from "drizzle-orm";

import type { Task } from "@/types";

import { db } from "@/db";
import { streamers } from "@/db/schema/streamers";
import { twitchAlerts } from "@/db/schema/twitch_alerts";

import { useStreamEmbed } from "@/functions/embeds";
import { useTwitchGame, useTwitchStream, useTwitchUser } from "@/functions/twitch";

const task: Task = {
  name: "check-streams",
  cronTime: "*/5 * * * *",
  execute: async (client) => {
    const result = await db.select().from(streamers);

    for (const streamer of result) {
      const stream = await useTwitchStream(streamer.channel);

      if (!stream && streamer.isLive) {
        await db
          .update(streamers)
          .set({ isLive: false })
          .where(eq(streamers.channel, streamer.channel));
        return;
      }

      if (!stream) return;
      if (stream && streamer.isLive) return;

      const user = await useTwitchUser(streamer.channel);
      if (!user) return;

      const game = await useTwitchGame(stream.game_id);
      if (!game) return;

      const alerts = await db
        .select()
        .from(twitchAlerts)
        .where(eq(twitchAlerts.streamerChannel, streamer.channel));

      for (const alert of alerts) {
        const channel = client.channels.cache.get(alert.alertsChannel);
        if (!channel || !channel.isTextBased()) return;

        (channel as TextChannel).send({
          content:
            alert.message ??
            `:red_circle: ${stream.user_name} is live on Twitch! @everyone`,
          embeds: [useStreamEmbed(stream, user, game)],
        });
      }

      await db
        .update(streamers)
        .set({ isLive: true })
        .where(eq(streamers.channel, streamer.channel));
    }
  },
};

export default task;
