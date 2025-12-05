import { Client, Message } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient: Client | null = null;

export const connectWebSocket = (
    projectId: string,
    onMessage: (msg: string) => void
) => {
    const token = localStorage.getItem("access_token");

    // Attach token as query param for backend to read
    const socket = new SockJS("http://localhost:8080/ws");


    stompClient = new Client({
        webSocketFactory: () => socket as any,
        reconnectDelay: 3000,
    });

    stompClient.onConnect = () => {
        console.log("🟢 Connected to WebSocket:", projectId);

        stompClient?.subscribe(`/topic/code/${projectId}`, (message: Message) => {
            console.log("📩 Received message:", message.body);
            onMessage(message.body);
        });
    };

    stompClient.onStompError = (frame) => {
        console.error("❌ STOMP error:", frame.headers["message"], frame.body);
    };

    stompClient.onWebSocketError = (event) => {
        console.error("❌ WebSocket error:", event);
    };

    stompClient.activate();
};

export const sendMessage = (projectId: string, code: string) => {
    if (stompClient && stompClient.connected) {
        console.log("📤 Sending message:", code);
        stompClient.publish({
            destination: `/app/code/${projectId}`,
            body: code,
        });
    } else {
        console.warn("⚠️ Tried to send message but WebSocket not connected");
    }
};
