import { FetchError, ofetch } from "ofetch";
import * as v from "valibot";

import { env } from "@/env";
import { logger } from "@/logger";

import { type TwitchToken, TwitchToken as TwitchTokenSchema } from "@/schemas/twitch/twitch-token";

let token: TwitchToken | undefined;

export const fetchTwitch = ofetch.create({
  baseURL: "https://api.twitch.tv/helix",
  headers: {
    Accept: "application/vnd.twitchtv.v5+json",
    "Client-ID": env.TWITCH_CLIENT_ID,
  },
  async onRequest({ options }) {
    if (token && token.expires_in > Date.now()) {
      options.headers.append("Authorization", `Bearer ${token.access_token}`);
      return;
    }

    try {
      const res = await ofetch("https://id.twitch.tv/oauth2/token", {
        method: "POST",
        body: {
          client_id: env.TWITCH_CLIENT_ID,
          client_secret: env.TWITCH_CLIENT_SECRET,
          grant_type: "client_credentials",
        },
      });

      const { success, output, issues } = v.safeParse(TwitchTokenSchema, res);

      if (!success) {
        logger.error(`❌ Failed to fetch Twitch token. Error: ${issues}`);
        token = undefined;

        return;
      }

      token = output;
      token.expires_in = Date.now() + token.expires_in * 1000;

      logger.info(
        `✅ Successfully fetched Twitch token. Expires in: ${token.expires_in}`
      );

      options.headers.append("Authorization", `Bearer ${token.access_token}`);
    } catch (error) {
      if (error instanceof FetchError) {
        logger.error(`❌ Failed to fetch Twitch token. Error: ${error.message}`);
        token = undefined;

        return;
      }

      throw error;
    }
  },
  async onResponse({ response }) {
    if (response.status >= 400) {
      logger.error(`❌ Failed to fetch Twitch data. Error: ${response.body}`);
      throw new Error("Failed to fetch Twitch data");
    }

    const rateLimit = response.headers.get("RateLimit-Remaining");

    if (rateLimit && Number(rateLimit) <= 5 && response.status === 200) {
      const bucketReset = response.headers.get("RateLimit-Reset");

      const waitTime = Math.ceil(Number(bucketReset) - Date.now() / 1000);

      logger.info(`⏳ Rate limit reached. Waiting for: ${waitTime} seconds`);
      await new Promise((resolve) => setTimeout(resolve, waitTime * 1000));
    }
  },
});
