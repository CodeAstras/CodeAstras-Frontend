// src/services/wsRun.ts
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export interface RunCodeBroadcastMessage {
  output: string;
  exitCode: number;
  triggeredBy: string;
}

export interface RunCodeRequestWS {
  projectId: string;
  userId: string;
  filename: string;
  timeoutSeconds: number;
}

let runClient: Client | null = null;
const WS_URL = "http://localhost:8080/ws";

/**
 * Connect to run-output channel for a room.
 * Backend broadcasts to: /topic/room/{roomId}/run-output
 */
export function connectRunSocket(
  roomId: string,
  onOutput: (msg: RunCodeBroadcastMessage) => void
) {
  if (runClient && runClient.active) return;

  runClient = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 5000,
    debug: () => {},

    onConnect: () => {
      runClient!.subscribe(
        `/topic/room/${roomId}/run-output`,
        (frame: IMessage) => {
          try {
            const msg = JSON.parse(frame.body) as RunCodeBroadcastMessage;
            onOutput(msg);
          } catch (e) {
            console.error(
              "Failed to parse RunCodeBroadcastMessage",
              e,
              frame.body
            );
          }
        }
      );
    },
  });

  runClient.activate();
}

/**
 * Send a run request:
 * maps to @MessageMapping("/room/{roomId}/run")
 */
export function sendRunRequest(roomId: string, payload: RunCodeRequestWS) {
  if (!runClient || !runClient.connected) {
    console.warn("Run socket not connected");
    return;
  }

  runClient.publish({
    destination: `/app/room/${roomId}/run`,
    body: JSON.stringify(payload),
  });
}
