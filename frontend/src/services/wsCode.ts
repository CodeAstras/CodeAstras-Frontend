import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { CodeEditMessage } from "../types/wsTypes";

let codeClient: Client | null = null;

export function connectCodeSocket(projectId: string, onMessage: (msg: CodeEditMessage) => void) {
    if (codeClient?.active) return;

    const token = localStorage.getItem("access_token");

    codeClient = new Client({
        webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
        reconnectDelay: 5000,
        connectHeaders: {
            Authorization: `Bearer ${token}`,
        },
    });


    codeClient.onConnect = () => {
        console.log("🟢 Code WebSocket connected");
        codeClient.subscribe(`/topic/projects/${projectId}/code`, frame => {
            onMessage(JSON.parse(frame.body));
        });
    };

    codeClient.activate();
}

export function sendCodeEdit(projectId: string, msg: Omit<CodeEditMessage, "token">) {
    if (!codeClient?.connected) return console.warn("Code WS not connected");

    codeClient.publish({
        destination: `/app/projects/${projectId}/edit`,
        body: JSON.stringify({
            ...msg,
            token: localStorage.getItem("access_token"),
        }),
    });
}