import ky, { HTTPError } from "ky";
import * as v from "valibot";

import { env } from "~/env";
import { logger } from "~/logger";

import {
  type TwitchToken,
  TwitchToken as TwitchTokenSchema,
} from "~/schemas/twitch/twitch-token";

let token: TwitchToken | undefined;

export const twitch = ky.create({
  prefixUrl: "https://api.twitch.tv/helix",
  headers: {
    Accept: "application/vnd.twitchtv.v5+json",
    "Client-ID": env.TWITCH_CLIENT_ID,
  },
  throwHttpErrors: false,
  hooks: {
    beforeRequest: [
      async (request) => {
        if (token && token.expires_in > Date.now()) {
          request.headers.set("Authorization", `Bearer ${token.access_token}`);
          return;
        }

        try {
          const res = await ky
            .post("https://id.twitch.tv/oauth2/token", {
              json: {
                client_id: env.TWITCH_CLIENT_ID,
                client_secret: env.TWITCH_CLIENT_SECRET,
                grant_type: "client_credentials",
              },
            })
            .json();

          const { success, output, issues } = v.safeParse(TwitchTokenSchema, res);

          if (!success) {
            logger.error(`❌ Failed to fetch Twitch token. Error: ${v.summarize(issues)}`);
            token = undefined;

            return;
          }

          token = output;
          token.expires_in = Date.now() + token.expires_in * 1000;

          const secondsUntilExpiry = Math.max(
            0,
            Math.floor((token.expires_in - Date.now()) / 1000)
          );

          logger.info(
            `✅ Successfully fetched Twitch token. Expires in: ${secondsUntilExpiry} seconds`
          );

          request.headers.set("Authorization", `Bearer ${token.access_token}`);
        } catch (error) {
          if (error instanceof HTTPError) {
            logger.error(`❌ Failed to fetch Twitch token. Error: ${error.message}`);
            token = undefined;

            return;
          }

          throw error;
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status >= 400) {
          const body = await response.clone().text();
          logger.error(
            `❌ Failed to fetch Twitch data. Error: ${body || response.statusText}`
          );
          throw new Error("Failed to fetch Twitch data");
        }

        const rateLimitHeader = response.headers.get("RateLimit-Remaining");
        const remaining = Number(rateLimitHeader);

        if (!Number.isNaN(remaining) && remaining <= 5 && response.ok) {
          const bucketReset = response.headers.get("RateLimit-Reset");
          const resetTimestamp = bucketReset ? Number(bucketReset) : undefined;

          if (resetTimestamp && !Number.isNaN(resetTimestamp)) {
            const waitTime = Math.ceil(resetTimestamp - Date.now() / 1000);

            if (waitTime > 0) {
              logger.info(`⏳ Rate limit reached. Waiting for: ${waitTime} seconds`);
              await new Promise((resolve) => setTimeout(resolve, waitTime * 1000));
            }
          }
        }
      },
    ],
  },
});
