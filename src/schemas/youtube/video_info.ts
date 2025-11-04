import * as v from "valibot";

// A simplified schema for a video thumbnail, as the original is an array
const Thumbnail = v.object({
  url: v.string(),
  width: v.number(),
  height: v.number(),
});

// A schema for the channel information
const Channel = v.object({
  id: v.string(),
  name: v.string(),
  url: v.string(),
});

/**
 * A valibot schema for essential YouTube video information.
 * This focuses on core metadata needed for display and playback.
 */
export const VideoInfo = v.object({
  /** The unique ID of the video. */
  id: v.optional(v.string()),

  /** The author of the video. */
  author: v.optional(v.string()),

  /** The title of the video. */
  title: v.optional(v.string()),

  /** The standard YouTube URL for the video. */
  url_canonical: v.nullable(v.string()),

  /** The duration of the video in seconds. */
  duration: v.optional(v.number()),

  /** A brief description of the video. */
  short_description: v.optional(v.string()),

  /** The number of views the video has. */
  view_count: v.optional(v.number()),

  /** The number of likes the video has. */
  like_count: v.optional(v.number()),

  /** The channel the video belongs to. Can be null if the channel is unavailable. */
  channel: v.nullable(Channel),

  /** A representative thumbnail for the video. */
  thumbnail: v.optional(v.array(Thumbnail)),

  /** Status flags that are important for playback logic. */
  is_live: v.optional(v.boolean()),
  is_upcoming: v.optional(v.boolean()),
});

export type VideoInfo = v.InferOutput<typeof VideoInfo>;
