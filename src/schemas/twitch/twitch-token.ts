import * as v from "valibot";

export const TwitchToken = v.object({
  access_token: v.string(),
  expires_in: v.number(),
  token_type: v.string(),
});

export type TwitchToken = v.InferOutput<typeof TwitchToken>;
