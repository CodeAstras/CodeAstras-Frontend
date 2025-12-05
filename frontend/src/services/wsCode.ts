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

export function connectCodeSocket(
  projectId: string,
  onMessage: (msg: CodeEditMessage) => void
) {
  if (codeClient && codeClient.active) return;

  codeClient = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 5000,
    debug: () => {},
  });

  codeClient.onConnect = () => {
    console.log("Connected to CODE socket for project:", projectId);

    codeClient!.subscribe(
      `/topic/project/${projectId}/code`,
      (frame: IMessage) => {
        try {
          const msg = JSON.parse(frame.body);
          onMessage(msg);
        } catch (e) {
          console.error("Code message parse failed", e);
        }
      }
    );
  };

  codeClient.activate();
}

export function sendCodeEdit(projectId: string, message: CodeEditMessage) {
  if (!codeClient || !codeClient.connected) {
    console.warn("Code socket not connected");
    return;
  }

  codeClient.publish({
    destination: `/app/project/${projectId}/edit`,
    body: JSON.stringify(message),
  });
}