import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { voiceWs, SignalMessage, CallParticipantsMessage } from "../services/wsVoice";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { Client } from "@stomp/stompjs";

interface VoiceContextType {
    joinCall: (projectId: string) => Promise<void>;
    leaveCall: () => void;
    toggleMute: () => void;
    isMuted: boolean;
    isConnected: boolean;
    activeSpeakers: string[];
    peers: Map<string, RTCPeerConnection>;
}

const VoiceContext = createContext<VoiceContextType | null>(null);

export const useVoice = () => {
    const context = useContext(VoiceContext);
    if (!context) {
        throw new Error("useVoice must be used within a VoiceProvider");
    }
    return context;
};

const RTC_CONFIG: RTCConfiguration = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
    ]
};

// GLOBAL AudioContext Singleton (per V1 Phase 2.1)
// Only create one audio context for the entire session to avoid resource limits
let globalAudioContext: AudioContext | null = null;
function getAudioContext() {
    if (!globalAudioContext) {
        globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (globalAudioContext.state === 'suspended') {
        globalAudioContext.resume();
    }
    return globalAudioContext;
}

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(true); // Default muted per V1 Rule 3.1
    const [activeSpeakers, setActiveSpeakers] = useState<string[]>([]);

    // State to force re-render when peers map changes
    const [peersMapVersion, setPeersMapVersion] = useState(0);

    const localStreamRef = useRef<MediaStream | null>(null);
    const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const projectIdRef = useRef<string | null>(null);
    const userIdRef = useRef<string>("");

    // Active Speaker Detection Refs
    const analysersRef = useRef<Map<string, AnalyserNode>>(new Map());
    const speakingFramesRef = useRef<Map<string, number>>(new Map());

    // Get User ID from token
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                userIdRef.current = decoded.userId || decoded.sub;
            } catch (e) {
                console.error("Failed to decode token for VoiceContext");
            }
        }
    }, []);

    const initLocalStream = async () => {
        try {
            // V1 Rule 6: Audio Only, acquire once
            if (localStreamRef.current) return localStreamRef.current;

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            localStreamRef.current = stream;

            // Apply initial mute state
            stream.getAudioTracks().forEach(track => track.enabled = !isMuted);

            return stream;
        } catch (error) {
            console.error("Failed to get local audio", error);
            toast.error("Could not access microphone");
            throw error;
        }
    };

    const joinCall = useCallback(async (projectId: string) => {
        if (isConnected) return;

        console.log(`📞 V1 Joining call for project: ${projectId}`);
        projectIdRef.current = projectId;

        await initLocalStream();

        voiceWs.connect(projectId, handleSignal);
        setIsConnected(true);
        toast.success("Joined voice channel");
    }, [isConnected]);

    const leaveCall = useCallback(() => {
        if (!isConnected) return;

        // V1 Rule 1.10: Send CALL_LEAVE
        voiceWs.disconnect(); // This sends CALL_LEAVE internally

        // Close all peers
        peersRef.current.forEach(pc => pc.close());
        peersRef.current.clear();
        setPeersMapVersion(v => v + 1);

        // Stop local tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        // Reset UI state
        setIsConnected(false);
        setActiveSpeakers([]);
        analysersRef.current.clear();
        speakingFramesRef.current.clear();

        toast.info("Left voice channel");
    }, [isConnected]);

    const handleSignal = async (signal: SignalMessage | CallParticipantsMessage) => {
        // Handle Participants List (V1 Rule 1.4: You Joined)
        if ('participants' in signal) { // Type guard for CallParticipantsMessage
            const { participants } = signal;
            console.log("👥 Received Participants List:", participants);

            // Create PC for each participant (NO OFFER)
            participants.forEach(pId => {
                if (pId !== userIdRef.current) {
                    createPeerConnection(pId, false); // False = Joiner never offers
                }
            });
            return;
        }

        const { type, payload, senderId, targetId } = signal;

        // If signal is directed to a specific user and it's not us, ignore
        if (targetId && targetId !== userIdRef.current) return;

        console.log(`📶 Received V1 signal: ${type} from ${senderId}`);

        switch (type) {
            case "CALL_JOIN": // V1 Rule 1.5: Someone Else Joined
                createPeerConnection(senderId, true); // True = Existing user sends offer
                break;
            case "CALL_OFFER": // V1 Rule 1.6: Handle OFFER
                await handleOffer(senderId, payload);
                break;
            case "CALL_ANSWER": // V1 Rule 1.7: Handle ANSWER
                await handleAnswer(senderId, payload);
                break;
            case "CALL_ICE": // V1 Rule 1.8: ICE Handling
                await handleIceCandidate(senderId, payload);
                break;
            case "CALL_LEAVE": // V1 Rule 1.11: Other User Left
                removePeer(senderId);
                break;
        }
    };

    // V1 Phase 1.3: Deterministic Offer Rule
    // initiator = true only if WE are existing user and THEY joined.
    const createPeerConnection = async (targetId: string, initiator: boolean) => {
        if (peersRef.current.has(targetId)) return peersRef.current.get(targetId);

        console.log(`🔗 Creating PC for ${targetId}. Initiator: ${initiator}`);
        const pc = new RTCPeerConnection(RTC_CONFIG);
        peersRef.current.set(targetId, pc);
        setPeersMapVersion(v => v + 1);

        // Add Local Audio Track
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!);
            });
        }

        // V1 Rule 1.9: Audio Playback + Phase 2 Entry Point (ontrack)
        pc.ontrack = (event) => {
            console.log(`🔊 Received remote track from ${targetId}`);
            const stream = event.streams[0];
            const remoteAudio = new Audio();
            remoteAudio.srcObject = stream;
            remoteAudio.autoplay = true;

            // Phase 2.2: Per Peer Detection Hook
            setupAudioAnalysis(targetId, stream);
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                voiceWs.sendSignal({
                    type: "CALL_ICE", // V1 Name
                    payload: event.candidate,
                    senderId: userIdRef.current,
                    targetId
                });
            }
        };

        if (initiator) {
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                voiceWs.sendSignal({
                    type: "CALL_OFFER", // V1 Name
                    payload: offer,
                    senderId: userIdRef.current,
                    targetId
                });
            } catch (err) {
                console.error("Error creating offer", err);
            }
        }

        return pc;
    };

    const handleOffer = async (senderId: string, offer: RTCSessionDescriptionInit) => {
        // If we don't have a PC yet (race condition or first contact), create it (passive)
        const pc = await createPeerConnection(senderId, false);
        if (!pc) return;

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        voiceWs.sendSignal({
            type: "CALL_ANSWER", // V1 Name
            payload: answer,
            senderId: userIdRef.current,
            targetId: senderId
        });
    };

    const handleAnswer = async (senderId: string, answer: RTCSessionDescriptionInit) => {
        const pc = peersRef.current.get(senderId);
        if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
    };

    const handleIceCandidate = async (senderId: string, candidate: RTCIceCandidateInit) => {
        const pc = peersRef.current.get(senderId);
        if (pc) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
    };

    const removePeer = (senderId: string) => {
        const pc = peersRef.current.get(senderId);
        if (pc) {
            // Cleanup Analyser
            const analyser = analysersRef.current.get(senderId);
            if (analyser) {
                analyser.disconnect();
                analysersRef.current.delete(senderId);
            }
            // Close PC
            pc.close();
            peersRef.current.delete(senderId);
            setPeersMapVersion(v => v + 1);
            toast.info("User left call");
        }
    };

    // V1 Phase 3.4: Implementation Rule (Only toggle track.enabled)
    const toggleMute = () => {
        if (localStreamRef.current) {
            const newState = !isMuted;
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !newState; // if isMuted=false (unmuting), enabled=true
            });
            setIsMuted(newState);
        }
    };

    // ----------------------------------------------------------------
    // Phase 2: Active Speaker Detection (Strict Implementation)
    // ----------------------------------------------------------------

    const setupAudioAnalysis = (userId: string, stream: MediaStream) => {
        const ctx = getAudioContext();
        if (!ctx) return;

        // V1 Phase 2.2: Source -> Analyser
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);

        analysersRef.current.set(userId, analyser);
        speakingFramesRef.current.set(userId, 0); // Init debouncer
    };

    useEffect(() => {
        let animationFrameId: number;

        const detectSpeaking = () => {
            if (!isConnected) return;
            const speaking: string[] = [];
            const SPEAKING_THRESHOLD = 30; // V1 Phase 2.7 heuristic

            analysersRef.current.forEach((analyser, userId) => {
                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(dataArray);

                const sum = dataArray.reduce((acc, val) => acc + val, 0);
                const average = sum / dataArray.length;

                // V1 Phase 2.8: Smoothing / Debounce
                let frames = speakingFramesRef.current.get(userId) || 0;

                if (average > SPEAKING_THRESHOLD) {
                    frames++;
                } else {
                    // Decay faster than attack? Or equal. 
                    // V1 suggestion: speakingFrames = Math.max(0, speakingFrames - 1);
                    frames = Math.max(0, frames - 1);
                }
                speakingFramesRef.current.set(userId, frames);

                if (frames > 5) { // Needs ~80ms continuous sound to trigger
                    speaking.push(userId);
                }
            });

            // V1 Phase 2.9: Derived State Only
            setActiveSpeakers(prev => {
                const isSame = prev.length === speaking.length && prev.every(id => speaking.includes(id));
                return isSame ? prev : speaking;
            });

            animationFrameId = requestAnimationFrame(detectSpeaking);
        };

        const raf = requestAnimationFrame(detectSpeaking);
        return () => {
            cancelAnimationFrame(raf);
        };
    }, [isConnected]);

    // ----------------------------------------------------------------
    // Phase 3: Push-to-Talk (PTT)
    // ----------------------------------------------------------------

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // V1 Phase 3.2: Space key
            if (e.code === "Space" && isMuted && isConnected && !e.repeat) { // Ignore repeat
                // V1 Phase 3.3: Safety Guards
                // Using document.activeElement checks
                const active = document.activeElement;
                const tagName = active?.tagName;
                const isInput = tagName === "INPUT" || tagName === "TEXTAREA";
                const isEditor = active?.classList.contains("monaco-mouse-cursor-text") || active?.closest(".monaco-editor");

                if (isInput || isEditor) return;

                e.preventDefault();

                // Unmute TEMPORARILY
                if (localStreamRef.current) {
                    localStreamRef.current.getAudioTracks().forEach(t => t.enabled = true);
                    setIsMuted(false); // Update UI state
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            // V1 Phase 3.2: Key Up -> Mute
            if (e.code === "Space" && !isMuted && isConnected) {
                // Safety: Even if focused input, releasing SPACE should probably mute to prevent hot mic?
                // V1 Spec says: "Losing focus mutes mic", "User releases key -> Mic mutes instantly".
                // We should mute regardless of focus to be safe.

                if (localStreamRef.current) {
                    // Check if it was a PTT release (we could store a 'isPTTActive' flag if we wanted to allow strict manual unmute + PTT mixed, but V1 implies PTT is the main mode or at least PTT ends mute)
                    // For now, simple logic: Release Space = Mute.
                    localStreamRef.current.getAudioTracks().forEach(t => t.enabled = false);
                    setIsMuted(true);
                }
            }
        };

        // V1 Phase 3.3: On blur -> force mute
        const handleBlur = () => {
            if (!isMuted && isConnected && localStreamRef.current) {
                localStreamRef.current.getAudioTracks().forEach(t => t.enabled = false);
                setIsMuted(true);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("blur", handleBlur);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("blur", handleBlur);
        };
    }, [isConnected, isMuted]);

    return (
        <VoiceContext.Provider value={{
            joinCall,
            leaveCall,
            toggleMute,
            isMuted,
            isConnected,
            activeSpeakers,
            peers: peersRef.current
        }}>
            {children}
        </VoiceContext.Provider>
    );
};
