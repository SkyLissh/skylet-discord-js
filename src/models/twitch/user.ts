import { z } from "zod";

import { TwitchResponseSchema } from "./twitch-response";

import { useFormatNumber } from "@/functions/use-format-number";

export const TwitchUserSchema = z.object({
  id: z.coerce.number(),
  login: z.string(),
  display_name: z.string(),
  broadcaster_type: z.string(),
  description: z.string(),
  profile_image_url: z.string(),
  offline_image_url: z.string(),
  view_count: z.coerce.number().transform(useFormatNumber),
  created_at: z.coerce.date(),
});

export type TwitchUser = z.infer<typeof TwitchUserSchema>;

export const TwitchUserResponseSchema = TwitchResponseSchema.extend({
  data: z.array(TwitchUserSchema),
});

export type TwitchUserResponse = z.infer<typeof TwitchUserResponseSchema>;
