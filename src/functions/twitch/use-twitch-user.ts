import { useTwitch } from "./use-twitch";

import { TwitchUserResponseSchema } from "@/models/twitch";

export const useTwitchUser = async (username: string) => {
  const res = await useTwitch("/users", { login: username });

  const user = TwitchUserResponseSchema.parse(res);

  if (user.data.length === 0) return;

  return user.data[0];
};
