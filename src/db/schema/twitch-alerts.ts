import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

import { guilds } from "./guilds";

export const twitchAlerts = sqliteTable("twitch_alerts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  guildId: text("guild_id")
    .notNull()
    .references(() => guilds.guildId, { onDelete: "cascade" }),
  channelId: text("channel_id").notNull(),
  streamer: text("streamer").notNull(),
  message: text("message").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const twitchAlertRelations = relations(twitchAlerts, ({ one }) => ({
  guild: one(guilds, {
    fields: [twitchAlerts.guildId],
    references: [guilds.guildId],
  }),
}));
