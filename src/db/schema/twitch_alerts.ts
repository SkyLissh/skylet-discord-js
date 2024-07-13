import { relations } from "drizzle-orm";
import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { guilds } from "./guilds";
import { streamers } from "./streamers";

export const twitchAlerts = sqliteTable(
  "twitch_alerts",
  {
    guildId: text("guild_id")
      .notNull()
      .references(() => guilds.id),
    streamerChannel: text("streamer_channel")
      .notNull()
      .references(() => streamers.channel),
    message: text("message"),
    alertsChannel: text("alerts_channel").notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.guildId, t.streamerChannel] }),
  })
);

export const twitchAlertsRelations = relations(twitchAlerts, ({ one }) => ({
  guild: one(guilds, {
    fields: [twitchAlerts.guildId],
    references: [guilds.id],
  }),
  streamer: one(streamers, {
    fields: [twitchAlerts.streamerChannel],
    references: [streamers.channel],
  }),
}));
