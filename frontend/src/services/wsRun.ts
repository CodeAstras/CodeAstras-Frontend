import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { RunCodeBroadcastMessage, RunCodeRequestWS } from "../types/wsTypes";

let runClient: Client | null = null;

export function connectRunSocket(projectId: string, onOutput: (msg: RunCodeBroadcastMessage) => void) {
    if (runClient?.active) return;

    const token = localStorage.getItem("access_token");

    runClient = new Client({
        webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
        reconnectDelay: 5000,
        connectHeaders: {
            Authorization: `Bearer ${token}`,
        },
    });


    runClient.onConnect = () => {
        console.log("🟢 Run WebSocket connected");

        runClient.subscribe(
            `/topic/projects/${projectId}/run-output`,
            frame => {
                console.log("🔥 RAW RUN FRAME:", frame.body);

                try {
                    const msg = JSON.parse(frame.body);
                    console.log("🔥 PARSED RUN MESSAGE:", msg);

                    // If a run finished with null output, log a diagnostic so we can investigate
                    if (msg.type === 'RUN_FINISHED' && (msg.output === null || msg.output === undefined)) {
                        console.warn('⚠️ RUN_FINISHED received with null/undefined output for session:', msg.sessionId, 'triggeredBy:', msg.triggeredBy);
                    }

                    onOutput(msg);
                } catch (err) {
                    console.error("❌ Error parsing run output:", err, "frame:", frame);
                }
            },
            {
                Authorization: `Bearer ${token}`,
            }
        );
    };

    // Report STOMP / WebSocket level issues so we can surface them to the UI
    runClient.onStompError = (frame) => {
        console.error("❌ STOMP error on Run socket:", frame);
    };

    runClient.onWebSocketError = (evt) => {
        console.error("❌ Run WebSocket low-level error:", evt);
    };

    runClient.onWebSocketClose = (evt) => {
        console.warn("⚠️ Run WebSocket closed:", evt);
    };

    runClient.activate();

}

export function sendRunRequest(projectId: string, payload: Omit<RunCodeRequestWS, "token">) {
    if (!runClient?.connected) {
        throw new Error("Run WebSocket is not connected");
    }

    const token = localStorage.getItem("access_token");

    try {
        runClient.publish({
            destination: `/app/projects/${projectId}/run`,
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });
    } catch (err) {
        console.error("❌ Failed to publish run request:", err);
        throw err;
    }
}