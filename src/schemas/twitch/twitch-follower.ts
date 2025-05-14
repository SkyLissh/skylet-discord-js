import * as v from "valibot";

export const TwitchFollower = v.object({
  user_id: v.string(),
  user_login: v.string(),
  user_name: v.string(),
  followed_at: v.pipe(v.string(), v.isoTimestamp()),
});

export type TwitchFollower = v.InferOutput<typeof TwitchFollower>;
