import { useTwitch } from "./use-twitch";

import { TwitchFollowerResponseSchema } from "@/models/twitch";

export const useTwitchFollowers = async (id: number) => {
  const res = await useTwitch("/channels/followers", { broadcaster_id: id, first: 1 });

  const followers = TwitchFollowerResponseSchema.parse(res);

  return followers.total;
};
