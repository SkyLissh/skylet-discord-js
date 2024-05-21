import { z } from "zod";

export const TwitchTokenSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  token_type: z.string(),
});

export type TwitchToken = z.infer<typeof TwitchTokenSchema>;
