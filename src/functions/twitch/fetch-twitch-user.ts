import * as v from "valibot";

import { fetchTwitch } from "./fetch-twitch";

import { paginatedTwitchResponse } from "@/schemas/twitch/twitch-response";
import { TwitchUser } from "@/schemas/twitch/twitch-user";

export const fetchTwitchUser = async (username: string) => {
  const res = await fetchTwitch("/users", {
    query: { login: username },
  });

  const user = v.parse(paginatedTwitchResponse(TwitchUser), res);

  if (user.data.length === 0) return;

  return user.data[0];
};
