import * as v from "valibot";

import { fetchTwitch } from "./fetch-twitch";

import { TwitchFollower } from "@/schemas/twitch/twitch-follower";
import { paginatedTwitchResponse } from "@/schemas/twitch/twitch-response";

export const fetchTwitchFollowers = async (id: number) => {
  const res = await fetchTwitch("/channels/followers", {
    query: { broadcaster_id: id, first: 1 },
  });

  const followers = v.parse(paginatedTwitchResponse(TwitchFollower), res);

  return followers.total;
};
