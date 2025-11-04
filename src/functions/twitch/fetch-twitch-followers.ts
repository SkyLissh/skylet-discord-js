import * as v from "valibot";

import { twitch } from "./fetch-twitch";

import { TwitchFollower } from "~/schemas/twitch/twitch-follower";
import { paginatedTwitchResponse } from "~/schemas/twitch/twitch-response";

export const fetchTwitchFollowers = async (id: number) => {
  const res = await twitch
    .get("channels/followers", {
      searchParams: { broadcaster_id: id, first: 1 },
    })
    .json();

  const followers = v.parse(paginatedTwitchResponse(TwitchFollower), res);

  return followers.total;
};
