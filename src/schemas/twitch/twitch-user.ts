import * as v from "valibot";

import { formatNumber } from "@/functions/format-number";

export const TwitchUser = v.object({
  id: v.pipe(v.string(), v.transform(Number)),
  login: v.string(),
  display_name: v.string(),
  broadcaster_type: v.string(),
  description: v.string(),
  profile_image_url: v.pipe(v.string(), v.url()),
  offline_image_url: v.union([
    v.pipe(
      v.literal(""),
      v.transform(() => undefined)
    ),
    v.pipe(v.string(), v.url()),
  ]),
  view_count: v.pipe(v.number(), v.transform(formatNumber)),
  created_at: v.pipe(
    v.string(),
    v.isoTimestamp(),
    v.transform((value) => new Date(value))
  ),
});

export type TwitchUser = v.InferOutput<typeof TwitchUser>;
