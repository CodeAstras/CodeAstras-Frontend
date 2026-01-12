import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

// Types
export interface SignalMessage {
    type: "offer" | "answer" | "ice-candidate" | "join" | "leave";
    payload: any;
    senderId: string;
    targetId?: string; // For direct signaling
}

class VoiceWebSocketService {
    private client: Client | null = null;
    private userId: string | null = null;
    private projectId: string | null = null;
    private onSignal: ((signal: SignalMessage) => void) | null = null;

    connect(projectId: string, onSignal: (signal: SignalMessage) => void) {
        this.projectId = projectId;
        this.onSignal = onSignal;

        const token = localStorage.getItem("access_token");
        if (!token) {
            console.error("No token found for voice WS");
            return;
        }

        try {
            const decoded = jwtDecode(token) as any;
            this.userId = decoded.userId || decoded.sub;
        } catch (e) {
            console.error("Invalid token", e);
            return;
        }

        this.client = new Client({
            webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            debug: (str) => console.log(`[VoiceWS]: ${str}`),
        });

        this.client.onConnect = () => {
            console.log("🟢 Voice WebSocket connected.");

            // Subscribe to project voice topic
            this.client?.subscribe(`/topic/projects/${projectId}/voice`, (message: IMessage) => {
                if (this.onSignal) {
                    const signal = JSON.parse(message.body);
                    // Filter out own messages if backend echoes them
                    if (signal.senderId !== this.userId) {
                        this.onSignal(signal);
                    }
                }
            });

            // Send Join Signal
            this.sendSignal({ type: "join", payload: {}, senderId: this.userId! });
        };

        this.client.activate();
    }

    sendSignal(signal: SignalMessage) {
        if (!this.client?.connected || !this.projectId) {
            console.warn("Voice WS not connected, cannot send signal", signal.type);
            return;
        }
        this.client.publish({
            destination: `/app/projects/${this.projectId}/voice`,
            body: JSON.stringify(signal),
        });
    }

    disconnect() {
        if (this.client) {
            // Send Leave Signal
            if (this.userId) {
                // Best effort leave
                try {
                    this.sendSignal({ type: "leave", payload: {}, senderId: this.userId });
                } catch (e) { /* ignore */ }
            }
            this.client.deactivate();
            this.client = null;
        }
        this.projectId = null;
        this.onSignal = null;
    }
}

export const voiceWs = new VoiceWebSocketService();
