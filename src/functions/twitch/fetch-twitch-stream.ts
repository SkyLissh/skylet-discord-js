import * as v from "valibot";

import { fetchTwitch } from "./fetch-twitch";

import { paginatedTwitchResponse } from "@/schemas/twitch/twitch-response";
import { TwitchStream } from "@/schemas/twitch/twitch-stream";

export const fetchTwitchStream = async (user: string) => {
  const res = await fetchTwitch("/streams", {
    query: { user_login: user },
  });

  const streams = v.parse(paginatedTwitchResponse(TwitchStream), res);

  if (streams.data.length === 0) return;

  return streams.data[0];
};
