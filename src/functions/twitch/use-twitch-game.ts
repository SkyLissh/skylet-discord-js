import { TwitchGameResponseSchema } from "@/models/twitch";
import { useTwitch } from "./use-twitch";

export const useTwitchGame = async (id: number) => {
  const res = await useTwitch("/games", { id });

  const games = TwitchGameResponseSchema.parse(res);

  if (games.data.length === 0) return;

  return games.data[0];
};
