import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { collabApi, Invitation, Collaborator } from "../services/collabApi";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

interface CollabContextType {
    pendingInvites: Invitation[];
    currentCollaborators: Collaborator[];
    refreshInvites: () => Promise<void>;
    refreshCollaborators: (projectId: string) => Promise<void>;
    acceptInvite: (invitationId: string) => Promise<void>;
    rejectInvite: (invitationId: string) => Promise<void>;
    isConnected: boolean;
}

const CollabContext = createContext<CollabContextType | null>(null);

export const useCollab = () => {
    const context = useContext(CollabContext);
    if (!context) {
        throw new Error("useCollab must be used within a CollaborationProvider");
    }
    return context;
};

interface DecodedToken {
    sub: string;
    userId?: string;
    email?: string;
}

export const CollaborationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [pendingInvites, setPendingInvites] = useState<Invitation[]>([]);
    const [currentCollaborators, setCurrentCollaborators] = useState<Collaborator[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [stompClient, setStompClient] = useState<Client | null>(null);

    // Fetch initial invites
    const refreshInvites = useCallback(async () => {
        try {
            const invites = await collabApi.getPendingInvites();
            setPendingInvites(invites);
        } catch (error) {
            console.error("Failed to fetch invites:", error);
        }
    }, []);

    // Refresh collaborators for a specific project
    const refreshCollaborators = useCallback(async (projectId: string) => {
        try {
            const collaborators = await collabApi.getProjectCollaborators(projectId);
            setCurrentCollaborators(collaborators);
        } catch (error) {
            console.error("Failed to fetch collaborators:", error);
        }
    }, []);

    // Setup WebSocket for Notifications
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        let userId = "";
        let email = "";
        try {
            const decoded = jwtDecode(token) as any;
            userId = decoded.userId || decoded.sub;
            email = decoded.email || decoded.sub; // Fallback to sub if email missing
        } catch (e) {
            console.error("Invalid token", e);
            return;
        }

        const client = new Client({
            webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            debug: (str) => console.log(`[CollabWS]: ${str}`),
        });

        client.onConnect = () => {
            setIsConnected(true);
            console.log(`🟢 Collab WebSocket connected. Subscribing to:`);
            console.log(`   - /topic/user/${userId}`);
            console.log(`   - /topic/user/${email}`);

            // Subscribe to User ID topic
            client.subscribe(`/topic/user/${userId}`, (message: IMessage) => {
                const event = JSON.parse(message.body);
                handleWebSocketEvent(event);
            });

            // Subscribe to Email topic (just in case backend uses email)
            // Ensure email is safe for URL (though STOMP handles it usually)
            client.subscribe(`/topic/user/${email}`, (message: IMessage) => {
                const event = JSON.parse(message.body);
                handleWebSocketEvent(event);
            });
        };

        client.onDisconnect = () => {
            setIsConnected(false);
        };

        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        client.activate();
        setStompClient(client);

        // Initial fetch
        refreshInvites();

        // Polling fallback (every 10 seconds)
        const pollInterval = setInterval(refreshInvites, 10000);

        return () => {
            client.deactivate();
            clearInterval(pollInterval);
        };
    }, [refreshInvites]);

    const handleWebSocketEvent = (event: any) => {
        console.log("📩 WS Event:", event);
        switch (event.type) {
            case "INVITE_SENT":
                toast.info(`New invite from ${event.actorEmail} for project "${event.projectName}"`);
                refreshInvites();
                break;
            case "INVITE_ACCEPTED":
                toast.success(`${event.actorEmail} accepted your invite`);
                break;
            case "INVITE_REJECTED":
                break;
            default:
                break;
        }
    };

    // Actions
    const acceptInvite = async (invitationId: string) => {
        await collabApi.acceptInvite(invitationId);
        await refreshInvites();
    };

    const rejectInvite = async (invitationId: string) => {
        await collabApi.rejectInvite(invitationId);
        await refreshInvites();
    };

    return (
        <CollabContext.Provider value={{
            pendingInvites,
            currentCollaborators,
            refreshInvites,
            refreshCollaborators,
            acceptInvite,
            rejectInvite,
            isConnected
        }}>
            {children}
        </CollabContext.Provider>
    );
};
