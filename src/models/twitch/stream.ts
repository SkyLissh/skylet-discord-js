import { z } from "zod";

import { TwitchResponseSchema } from "./twitch-response";

import { useFormatNumber } from "@/functions/use-format-number";

export const TwitchStreamSchema = z.object({
  id: z.coerce.number(),
  user_id: z.coerce.number(),
  user_login: z.string(),
  user_name: z.string(),
  game_id: z.coerce.number(),
  game_name: z.string(),
  title: z.string(),
  viewer_count: z.coerce.number().transform(useFormatNumber),
  thumbnail_url: z
    .string()
    .transform((url) => url.replace("{width}x{height}", "1920x1080")),
  started_at: z.coerce.date(),
});

export type TwitchStream = z.infer<typeof TwitchStreamSchema>;

export const TwitchStreamResponseSchema = TwitchResponseSchema.extend({
  data: z.array(TwitchStreamSchema),
});

export type TwitchStreamResponse = z.infer<typeof TwitchStreamResponseSchema>;
