import * as v from "valibot";

import { twitch } from "./fetch-twitch";

import { TwitchGame } from "~/schemas/twitch/twitch-game";
import { paginatedTwitchResponse } from "~/schemas/twitch/twitch-response";

export const fetchTwitchGame = async (id: number) => {
  const res = await twitch.get("games", { searchParams: { id } }).json();

  const games = v.parse(paginatedTwitchResponse(TwitchGame), res);

  if (games.data.length === 0) return;

  return games.data[0];
};
