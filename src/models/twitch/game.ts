import { z } from "zod";

import { TwitchResponseSchema } from "./twitch-response";

export const TwitchGameSchema = z.object({
  id: z.string(),
  name: z.string(),
  box_art_url: z.string().transform((url) => url.replace(/{width}x{height}/, "600x800")),
});

export type TwitchGame = z.infer<typeof TwitchGameSchema>;

export const TwitchGameResponseSchema = TwitchResponseSchema.extend({
  data: z.array(TwitchGameSchema),
});

export type TwitchGameResponse = z.infer<typeof TwitchGameResponseSchema>;
