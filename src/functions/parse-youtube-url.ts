type YouTubeContentType = "video" | "playlist";

export interface YouTubeURLResult {
  id: string;
  type: YouTubeContentType;
}

/**
 * Parses a YouTube URL and extracts the ID and content type (video or playlist)
 * @param url - The YouTube URL to parse
 * @returns An object containing the ID and type, or null if invalid
 */
export function parseYouTubeURL(url: string): YouTubeURLResult | null {
  // Extract video ID (11 characters)
  const videoMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (videoMatch) {
    return {
      id: videoMatch[1],
      type: "video",
    };
  }

  // Extract playlist ID (starts with PL, RD, UU, etc.)
  const playlistMatch = url.match(/(?:youtube\.com\/playlist\?list=|youtube\.com\/watch\?.*list=)([a-zA-Z0-9_-]+)/);
  if (playlistMatch) {
    const playlistId = playlistMatch[1];
    // Verify it looks like a playlist ID
    if (playlistId.startsWith("PL") || playlistId.startsWith("RD") || playlistId.startsWith("UU")) {
      return {
        id: playlistId,
        type: "playlist",
      };
    }
  }

  return null;
}
