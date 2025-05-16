import { defineConfig } from "drizzle-kit";

import { env } from "@/env";

console.log(env.TURSO_DATABASE_URL);

export default defineConfig({
  schema: "./src/db/schema",
  dialect: "turso",
  dbCredentials: {
    url: env.TURSO_DATABASE_URL,
    // authToken: env.TURSO_AUTH_TOKEN,
  },
});
