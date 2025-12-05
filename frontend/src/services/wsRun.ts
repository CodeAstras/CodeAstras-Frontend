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

export function connectRunSocket(
  projectId: string,
  onOutput: (msg: RunCodeBroadcastMessage) => void
) {
  if (runClient && runClient.active) return;

  runClient = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 5000,
    debug: () => {},
  });

  runClient.onConnect = () => {
    console.log("Connected to RUN socket:", projectId);

    runClient!.subscribe(
      `/topic/project/${projectId}/run-output`,
      (frame: IMessage) => {
        try {
          const msg = JSON.parse(frame.body);
          onOutput(msg);
        } catch (e) {
          console.error("Failed to parse run output", e);
        }
      }
    );
  };

  runClient.activate();
}

export function sendRunRequest(
  projectId: string,
  payload: RunCodeRequestWS
) {
  if (!runClient || !runClient.connected) {
    console.warn("Run socket not connected");
    return;
  }

  runClient.publish({
    destination: `/app/project/${projectId}/run`,
    body: JSON.stringify(payload),
  });
}
