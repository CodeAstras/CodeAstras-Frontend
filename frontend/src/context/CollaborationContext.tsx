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
    lastUpdate: number;
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
    const [lastUpdate, setLastUpdate] = useState(0);

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

    // ... (WebSocket setup remains same) ...

    const handleWebSocketEvent = (event: any) => {
        console.log("📩 WS Event:", event);
        switch (event.type) {
            case "INVITE_SENT":
                toast.info(`New invite from ${event.actorEmail} for project "${event.projectName}"`);
                refreshInvites();
                setLastUpdate(Date.now());
                break;
            case "INVITE_ACCEPTED":
                toast.success(`${event.actorEmail} accepted your invite`);
                setLastUpdate(Date.now());
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
        setLastUpdate(Date.now());
    };

    const rejectInvite = async (invitationId: string) => {
        await collabApi.rejectInvite(invitationId);
        await refreshInvites();
        setLastUpdate(Date.now());
    };

    return (
        <CollabContext.Provider value={{
            pendingInvites,
            currentCollaborators,
            refreshInvites,
            refreshCollaborators,
            acceptInvite,
            rejectInvite,
            isConnected,
            lastUpdate // Expose to consumers
        }}>
            {children}
        </CollabContext.Provider>
    );
};
