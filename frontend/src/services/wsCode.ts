// src/services/wsCode.ts
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export interface CodeEditMessage {
  projectId: string;
  userId: string;
  path: string;
  content: string;
}

let codeClient: Client | null = null;

const WS_URL = "http://localhost:8080/ws";

/**
 * Connect to code-sync WebSocket for a given room (roomId = projectId)
 * and call onMessage whenever someone edits code.
 */
export function connectCodeSocket(
  roomId: string,
  onMessage: (msg: CodeEditMessage) => void
) {
  if (codeClient && codeClient.active) return;

  codeClient = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 5000,
    debug: () => {}, // change to console.log for debugging

    onConnect: () => {
      // Subscribe to backend broadcasts:
      // @SendTo("/topic/room/{roomId}/code")
      codeClient!.subscribe(`/topic/room/${roomId}/code`, (frame: IMessage) => {
        try {
          const msg = JSON.parse(frame.body) as CodeEditMessage;
          onMessage(msg);
        } catch (e) {
          console.error("Failed to parse CodeEditMessage", e, frame.body);
        }
      });
    },
  });

  codeClient.activate();
}

/**
 * Send a code edit event to the backend:
 * maps to @MessageMapping("/room/{roomId}/edit")
 */
export function sendCodeEdit(roomId: string, message: CodeEditMessage) {
  if (!codeClient || !codeClient.connected) {
    console.warn("Code socket not connected");
    return;
  }

  codeClient.publish({
    destination: `/app/room/${roomId}/edit`,
    body: JSON.stringify(message),
  });
}
