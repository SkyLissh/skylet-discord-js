import EventEmitter from "node:events";

import type { AudioPlayer, AudioResource, VoiceConnection } from "@discordjs/voice";
import {
  AudioPlayerStatus,
  NoSubscriberBehavior,
  VoiceConnectionDisconnectReason,
  VoiceConnectionStatus,
  createAudioPlayer,
  entersState,
} from "@discordjs/voice";

import type { VideoInfo } from "~/schemas/youtube/video_info";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Manages a queue of songs and audio playback for a Discord voice connection.
 * 
 * Handles song queuing, playback control (play, pause, resume, skip, stop),
 * and emits events for queue state changes. Uses Discord.js voice library
 * for audio streaming and connection management.
 * 
 * @emits songAdded - Emitted when a song is added to the queue
 * @emits playNext - Emitted when the next song should be fetched and played
 * @emits songStarted - Emitted when a song starts playing
 * @emits songFinished - Emitted when a song finishes playing
 * @emits queueEmpty - Emitted when the queue becomes empty
 */
export class Queue extends EventEmitter {
  /** The voice connection associated with this queue */
  readonly connection: VoiceConnection;

  /** Private list of songs in the queue */
  #songs: VideoInfo[] = [];
  
  /** Private audio player for playback control */
  #player: AudioPlayer;

  /**
   * Creates a new Queue instance.
   * 
   * Initializes the audio player, subscribes it to the voice connection,
   * and sets up event listeners for player state changes and connection
   * status changes.
   * 
   * @param connection - The voice connection to manage audio for
   */
  constructor(connection: VoiceConnection) {
    super();

    this.connection = connection;
    this.#player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Stop,
      },
    });

    this.connection.subscribe(this.#player);

    this.#player.on(AudioPlayerStatus.Idle, () => {
      const finishedSong = this.#songs.shift();

      if (finishedSong) {
        this.emit("songFinished", finishedSong);
      }

      if (this.#songs.length > 0) {
        this.#processQueue();
      } else {
        this.emit("queueEmpty");
      }
    });

    this.connection.on(
      VoiceConnectionStatus.Disconnected,

      async (_oldState, newState) => {
        if (
          newState.reason === VoiceConnectionDisconnectReason.WebSocketClose &&
          newState.closeCode === 4014
        ) {
          try {
            await entersState(this.connection, VoiceConnectionStatus.Connecting, 5_000);
            return;
          } catch {
            this.connection.destroy();
            return;
          }
        }

        if (this.connection.rejoinAttempts < 5) {
          await wait((this.connection.rejoinAttempts + 1) * 5_000);
          this.connection.rejoin();
          return;
        }

        this.connection.destroy();
      }
    );
  }

  /**
   * Processes the queue and starts playing the next song if available.
   * 
   * Checks if the player is idle and there are songs in the queue.
   * If conditions are met, emits a 'playNext' event to request the song stream.
   * The actual stream fetching is delegated to the Melodi class to maintain
   * separation of concerns.
   * 
   * @private
   */
  async #processQueue() {
    // If already playing or buffering, do nothing
    if (this.#player.state.status !== AudioPlayerStatus.Idle) return;

    // If there are no songs, do nothing
    if (this.#songs.length === 0) return;

    // This is where you'd get the stream. We'll pass the download logic
    // back to the Melodi class to keep the Queue class decoupled from YouTube.
    // We'll use an event for this.
    this.emit("playNext", this.#songs[0]);
  }

  /**
   * Plays an audio resource.
   * 
   * Starts playback of the provided audio resource and emits a 'songStarted'
   * event with the current song information.
   * 
   * @param resource - The audio resource to play
   */
  play(resource: AudioResource) {
    this.#player.play(resource);
    this.emit("songStarted", this.#songs[0]);
  }

  /**
   * Adds one or more songs to the queue.
   * 
   * Appends the provided song(s) to the queue and emits a 'songAdded' event.
   * If the player is not currently playing, automatically starts processing
   * the queue.
   * 
   * @param song - A single VideoInfo object or an array of VideoInfo objects to add
   */
  add(song: VideoInfo | VideoInfo[]) {
    if (Array.isArray(song)) {
      this.#songs.push(...song);
    } else {
      this.#songs.push(song);
    }

    this.emit("songAdded", song);

    if (this.#player.state.status !== AudioPlayerStatus.Playing) {
      this.#processQueue();
    }
  }

  /**
   * Pauses the currently playing song.
   * 
   * Only pauses if a song is currently playing. Has no effect if already paused
   * or if no song is playing.
   */
  pause() {
    if (this.#player.state.status === AudioPlayerStatus.Playing) {
      this.#player.pause();
    }
  }

  /**
   * Resumes playback of a paused song.
   * 
   * Only resumes if a song is currently paused. Has no effect if already playing
   * or if no song is paused.
   */
  resume() {
    if (this.#player.state.status === AudioPlayerStatus.Paused) {
      this.#player.unpause();
    }
  }

  /**
   * Stops playback and clears the entire queue.
   * 
   * Removes all songs from the queue and stops the audio player.
   * This will trigger the 'Idle' event, which may emit a 'queueEmpty' event.
   */
  stop() {
    this.#songs = []; // Clear the queue
    this.#player.stop(); // This will trigger the 'Idle' event
  }

  /**
   * Skips the currently playing song.
   * 
   * Stops the current song, which triggers the player's 'Idle' event.
   * This causes the queue to process and play the next song if available.
   */
  skip() {
    this.#player.stop();
  }

  /**
   * Cleans up the queue and prepares for disconnection.
   * 
   * Stops playback, clears all event listeners from the player,
   * and prepares the queue for garbage collection.
   */
  leave() {
    this.#player.stop();
    this.#player.removeAllListeners();
  }
}
