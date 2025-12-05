import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { RunCodeBroadcastMessage, RunCodeRequestWS } from "../types/wsTypes";

let runClient: Client | null = null;

export function connectRunSocket(projectId: string, onOutput: (msg: RunCodeBroadcastMessage) => void) {
    if (runClient?.active) return;

    runClient = new Client({
        webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
        reconnectDelay: 5000,
    });

    runClient.onConnect = () => {
        console.log("🟢 Run WebSocket connected");
        runClient.subscribe(`/topic/project/${projectId}/run-output`, frame => {
            onOutput(JSON.parse(frame.body));
        });
    };

    runClient.activate();
}

export function sendRunRequest(projectId: string, payload: Omit<RunCodeRequestWS, "token">) {
    if (!runClient?.connected) return console.warn("Run WS not connected");

    runClient.publish({
        destination: `/app/project/${projectId}/run`,
        body: JSON.stringify({
            ...payload,
            token: localStorage.getItem("access_token"),
        }),
    });
}
