export class InvalidUrl extends Error {
  constructor(url: string) {
    super(`Invalid URL: ${url}`);
    this.name = "InvalidUrl";
  }
}

export class PlaylistNotSupported extends Error {
  constructor() {
    super("Playlist support is not yet implemented. Please provide a direct video URL.");
    this.name = "PlaylistNotSupported";
  }
}

export class NoResultsFound extends Error {
  constructor() {
    super("No results found");
    this.name = "NoResultsFound";
  }
}
