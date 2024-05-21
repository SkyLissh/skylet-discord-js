import { useTwitch } from "./use-twitch";

import { TwitchStreamResponseSchema } from "@/models/twitch";

export const useTwitchStream = async (user: string) => {
  const res = await useTwitch("/streams", { user_login: user });

  const streams = TwitchStreamResponseSchema.parse(res);

  if (streams.data.length === 0) return;

  return streams.data[0];
};
