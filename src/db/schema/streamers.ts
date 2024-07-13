import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { twitchAlerts } from "./twitch_alerts";

export const streamers = sqliteTable("streamers", {
  channel: text("channel").notNull().primaryKey(),
  isLive: int("is_live", { mode: "boolean" }).notNull().default(false),
});

export const streamersRelations = relations(streamers, ({ many }) => ({
  twitchAlerts: many(twitchAlerts),
}));
