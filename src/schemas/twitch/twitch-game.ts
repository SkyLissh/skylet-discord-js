import * as v from "valibot";

export const TwitchGame = v.object({
  id: v.string(),
  name: v.string(),
  box_art_url: v.pipe(
    v.string(),
    v.transform((url) => url.replace(/{width}x{height}/, "600x800"))
  ),
});

export type TwitchGame = v.InferOutput<typeof TwitchGame>;
