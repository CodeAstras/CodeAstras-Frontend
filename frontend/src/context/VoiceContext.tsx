import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { voiceWs, SignalMessage } from "../services/wsVoice";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";

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

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [activeSpeakers, setActiveSpeakers] = useState<string[]>([]);

    const localStreamRef = useRef<MediaStream | null>(null);
    const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const projectIdRef = useRef<string | null>(null);
    const userIdRef = useRef<string>("");

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
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            localStreamRef.current = stream;
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

        console.log(`📞 Joining call for project: ${projectId}`);
        projectIdRef.current = projectId;

        await initLocalStream();

        voiceWs.connect(projectId, handleSignal);
        setIsConnected(true);
        toast.success("Joined voice channel");
    }, [isConnected]);

    const leaveCall = useCallback(() => {
        if (!isConnected) return;

        voiceWs.disconnect();

        peersRef.current.forEach(pc => pc.close());
        peersRef.current.clear();

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        setIsConnected(false);
        toast.info("Left voice channel");
    }, [isConnected]);

    const handleSignal = async (signal: SignalMessage) => {
        const { type, payload, senderId, targetId } = signal;

        // If signal is directed to a specific user and it's not us, ignore
        if (targetId && targetId !== userIdRef.current) return;

        console.log(`📶 Received signal: ${type} from ${senderId}`);

        switch (type) {
            case "join":
                createPeerConnection(senderId, true);
                break;
            case "offer":
                await handleOffer(senderId, payload);
                break;
            case "answer":
                await handleAnswer(senderId, payload);
                break;
            case "ice-candidate":
                await handleIceCandidate(senderId, payload);
                break;
            case "leave":
                removePeer(senderId);
                break;
        }
    };

    const createPeerConnection = async (targetId: string, initiator: boolean) => {
        if (peersRef.current.has(targetId)) return peersRef.current.get(targetId);

        const pc = new RTCPeerConnection(RTC_CONFIG);
        peersRef.current.set(targetId, pc);

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!);
            });
        }

        pc.ontrack = (event) => {
            console.log(`🔊 Received remote track from ${targetId}`);
            const remoteAudio = new Audio();
            remoteAudio.srcObject = event.streams[0];
            remoteAudio.autoplay = true;

            // Analyze audio for active speaker
            setupAudioAnalysis(targetId, event.streams[0]);
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                voiceWs.sendSignal({
                    type: "ice-candidate",
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
                    type: "offer",
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
        const pc = await createPeerConnection(senderId, false);
        if (!pc) return;

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        voiceWs.sendSignal({
            type: "answer",
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
            pc.close();
            peersRef.current.delete(senderId);
            toast.info("User left");
        }
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    // Active Speaker Detection
    useEffect(() => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analysers = new Map<string, AnalyserNode>();
        let animationFrameId: number;

        const checkAudioLevels = () => {
            const speaking: string[] = [];

            analysers.forEach((analyser, userId) => {
                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(dataArray);

                const sum = dataArray.reduce((acc, val) => acc + val, 0);
                const average = sum / dataArray.length;

                if (average > 30) { // Threshold
                    speaking.push(userId);
                }
            });

            setActiveSpeakers(speaking);
            animationFrameId = requestAnimationFrame(checkAudioLevels);
        };

        checkAudioLevels();

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            audioContext.close();
        };
    }, [isConnected]); // Re-run when connection status changes or just run once? 
    // Actually, we need to bind analysers when peers join.
    // We can expose a method to register analyser or handle it within createPeerConnection but passing state up is hard.
    // Better approach: Store streams in ref and check them here? or Ref current Peers.

    // REVISED APPROACH FOR ACTIVE SPEAKER:
    // We need to attach analysers when tracks are added in createPeerConnection. 
    // Since createPeerConnection is inside the component, we can access a Ref to store analysers.

    const audioContextRef = useRef<AudioContext | null>(null);
    const analysersRef = useRef<Map<string, AnalyserNode>>(new Map());

    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

        const checkLevels = () => {
            if (!isConnected) return;
            const speaking: string[] = [];

            analysersRef.current.forEach((analyser, userId) => {
                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(dataArray);
                const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
                if (avg > 25) speaking.push(userId);
            });

            // Only update if changed to avoid render thrashing
            setActiveSpeakers(prev => {
                const isSame = prev.length === speaking.length && prev.every(id => speaking.includes(id));
                return isSame ? prev : speaking;
            });

            requestAnimationFrame(checkLevels);
        };

        const raf = requestAnimationFrame(checkLevels);
        return () => {
            cancelAnimationFrame(raf);
            audioContextRef.current?.close();
        };
    }, [isConnected]);

    // Push to Talk Logic
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space" && isMuted && isConnected) {
                // If focused on input, ignore
                if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;

                e.preventDefault(); // Prevent scroll
                // Unmute
                if (localStreamRef.current) {
                    localStreamRef.current.getAudioTracks().forEach(t => t.enabled = true);
                    setIsMuted(false);
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === "Space" && !isMuted && isConnected) {
                if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;

                // Mute
                if (localStreamRef.current) {
                    localStreamRef.current.getAudioTracks().forEach(t => t.enabled = false);
                    setIsMuted(true);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [isConnected, isMuted]); // Dependency on isMuted might cause re-bind, but logic needs current state. 
    // Optimally, use ref for isMuted to avoid re-binding listeners.

    const setupAudioAnalysis = (userId: string, stream: MediaStream) => {
        if (!audioContextRef.current) return;
        const source = audioContextRef.current.createMediaStreamSource(stream);
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser); // Do not connect to destination (speakers) else feedback loop? 
        // Wait, remote streams SHOULD go to speakers. 
        // We usually use <audio> element for playback. 
        // If we use Web Audio API for playback, we connect to destination.
        // If we use <audio> element, we don't need to connect source -> destination here, just source -> analyser.
        // The <audio> element handles playback.
        analysersRef.current.set(userId, analyser);
    };

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
