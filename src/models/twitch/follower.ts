import { z } from "zod";

import { TwitchResponseSchema } from "./twitch-response";

export const TwitchFollowerSchema = z.object({
  from_id: z.coerce.number(),
  from_name: z.string(),
  from_login: z.string(),
  to_id: z.coerce.number(),
  to_name: z.string(),
  followed_at: z.string().datetime(),
});

export type TwitchFollower = z.infer<typeof TwitchFollowerSchema>;

export const TwitchFollowerResponseSchema = TwitchResponseSchema.extend({
  data: z.array(TwitchFollowerSchema),
});

export type TwitchFollowerResponse = z.infer<typeof TwitchFollowerResponseSchema>;
