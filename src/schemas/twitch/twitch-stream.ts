import * as v from "valibot";

import { formatNumber } from "~/functions/format-number";

export const TwitchStream = v.object({
  id: v.pipe(v.string(), v.transform(Number)),
  user_id: v.pipe(v.string(), v.transform(Number)),
  user_login: v.string(),
  user_name: v.string(),
  game_id: v.pipe(v.string(), v.transform(Number)),
  game_name: v.string(),
  title: v.string(),
  viewer_count: v.pipe(v.number(), v.transform(formatNumber)),
  thumbnail_url: v.pipe(
    v.string(),
    v.transform((url) => url.replace("{width}x{height}", "1920x1080"))
  ),
  started_at: v.pipe(
    v.string(),
    v.isoTimestamp(),
    v.transform((value) => new Date(value))
  ),
});

export type TwitchStream = v.InferOutput<typeof TwitchStream>;
