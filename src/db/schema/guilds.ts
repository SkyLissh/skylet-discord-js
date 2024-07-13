import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

import { twitchAlerts } from "./twitch_alerts";

export const guilds = sqliteTable("guilds", {
  id: text("id").notNull().primaryKey(),
});

export const guildsRelations = relations(guilds, ({ many }) => ({
  twitchAlerts: many(twitchAlerts),
}));
