import axios, { AxiosError } from "axios";

import type { TwitchToken } from "@/models/twitch";
import { TwitchTokenSchema } from "@/models/twitch";
import { err, text, variable } from "@/theme";

const fetchTwitch = axios.create({
  baseURL: "https://api.twitch.tv/helix",
  headers: {
    Accept: "application/vnd.twitchtv.v5+json",
    "Client-ID": process.env.TWITCH_CLIENT_ID,
  },
  validateStatus: () => true,
});

let token: TwitchToken | undefined;

fetchTwitch.interceptors.request.use(
  async (config) => {
    if (token && token.expires_in > Date.now()) {
      config.headers["Authorization"] = `Bearer ${token.access_token}`;

      return config;
    }

    try {
      const res = await axios.post("https://id.twitch.tv/oauth2/token", {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: "client_credentials",
      });

      token = TwitchTokenSchema.parse(res.data);
      token.expires_in = Date.now() + token.expires_in * 1000;

      console.log(
        `${text("✅ Successfully fetched Twitch token. Expires in:")} ${variable(
          token.expires_in
        )}`
      );

      config.headers["Authorization"] = `Bearer ${token.access_token}`;
      return config;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(
          `${text("❌ Failed to fetch Twitch token. Error:")} ${variable(error.status)}`
        );

        console.log(err(JSON.stringify(error.toJSON())));

        token = undefined;

        return config;
      }

      throw error;
    }
  },
  (error) => {
    console.log(err(error.toJSON()));

    return Promise.reject(error);
  }
);

export const useTwitch = async (url: string, params: Record<string, unknown>) => {
  const res = await fetchTwitch.get(url, { params });

  if (res.status >= 400) {
    console.log(
      `${text("❌ Failed to fetch Twitch data. Error:")} ${variable(res.status)}`
    );

    console.log(err(JSON.stringify(res.data)));
  }

  if (res.headers["RateLimit-Remaining"] <= 5 && res.status === 200) {
    const bucketReset: number = res.headers["RateLimit-Reset"];
    const waitTime = Math.ceil(bucketReset - Date.now() / 1000);

    console.log(
      `${text("⏳ Rate limit reached. Waiting for:")} ${variable(waitTime)} ${text(
        "seconds"
      )}`
    );

    await new Promise((resolve) => setTimeout(resolve, waitTime * 1000));
  }

  return res.data as Record<string, unknown>;
};
