import { createEnv } from "@t3-oss/env-core";
import * as v from "valibot";

export const env = createEnv({
  server: {
    DISCORD_CLIENT_ID: v.string(),
    DISCORD_TOKEN: v.string(),
    DISCORD_GUILD_ID: v.string(),
    TWITCH_CLIENT_ID: v.string(),
    TWITCH_CLIENT_SECRET: v.string(),
    NODE_ENV: v.union([v.literal("development"), v.literal("production")]),
    TURSO_DATABASE_URL: v.string(),
    TURSO_AUTH_TOKEN: v.string(),
  },
  runtimeEnv: process.env,
});
