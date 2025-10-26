import type { VoiceConnection } from "@discordjs/voice";
import {
  VoiceConnectionStatus,
  VoiceConnectionDisconnectReason,
  entersState,
} from "@discordjs/voice";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export class Queue {
  connection: VoiceConnection;

  constructor(connection: VoiceConnection) {
    this.connection = connection;

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
}
