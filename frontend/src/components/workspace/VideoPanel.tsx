import { useState, useEffect, useMemo } from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, Settings, PhoneOff, MoreVertical } from 'lucide-react';
import { useVoice } from '../../context/VoiceContext';
import { useCollab } from '../../context/CollaborationContext';
import { cn } from '../../components/ui/utils';
import { jwtDecode } from "jwt-decode"; // Ensure you have this installed

interface VideoPanelProps {
  mode: 'video' | 'audio';
  onModeChange: (mode: 'video' | 'audio') => void;
}

export function VideoPanel({ mode, onModeChange }: VideoPanelProps) {
  const { isConnected, isMuted, toggleMute, leaveCall, activeSpeakers, peers } = useVoice();
  const { currentCollaborators } = useCollab();
  const [cameraOn, setCameraOn] = useState(false);
  const [myId, setMyId] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setMyId(decoded.userId || decoded.sub);
      } catch (e) {
        console.error("Failed to decode token in VideoPanel");
      }
    }
  }, []);

  // Derive real participants list
  const participants = useMemo(() => {
    // 1. Find "Me"
    const safeCollaborators = Array.isArray(currentCollaborators) ? currentCollaborators : [];
    const meCollaborator = safeCollaborators.find(c => c?.userId === myId) || {
      userId: myId,
      email: 'Me',
      role: 'VIEWER'
    };

    const myProfile = {
      id: myId,
      name: meCollaborator.email.split('@')[0], // Simple name extraction
      avatar: meCollaborator.email.substring(0, 2).toUpperCase(),
      color: '#0ea5e9', // You are always blue/cyan
      isMe: true
    };

    // 2. Find Others (Connected Peers)
    // 'peers' map contains connection objects for connected users. Keys are userIds.
    const otherProfiles = Array.from(peers.keys()).map(peerId => {
      const collaborator = safeCollaborators.find(c => c?.userId === peerId);
      return {
        id: peerId,
        name: collaborator ? collaborator.email.split('@')[0] : `User ${peerId.substring(0, 4)}`,
        avatar: collaborator ? collaborator.email.substring(0, 2).toUpperCase() : '??',
        color: '#8b5cf6', // others are purple
        isMe: false
      };
    });

    return [myProfile, ...otherProfiles];
  }, [currentCollaborators, peers, myId]);

  // Logic to determine main speaker (Active Speaker, else You)
  // If an active speaker exists and is NOT me, show them.
  // If multiple, show the first one.
  // If none, show me.
  const mainSpeakerId = activeSpeakers.find(id => id !== myId) || myId;
  const mainSpeaker = participants.find(p => p.id === mainSpeakerId) || participants[0];

  const others = participants.filter(p => p.id !== mainSpeaker.id);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-white/90">Live Session</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/60 bg-white/5 px-2 py-1 rounded-md">
          <span className="text-xs font-medium">{participants.length + (activeSpeakers.length > 0 ? 0 : 0)}</span>
          <span className="text-[10px] uppercase">users</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-4 pb-20 overflow-y-auto space-y-4">

        {/* Active Speaker / Main Card */}
        <div className="relative aspect-[4/3] w-full bg-[#15151a] rounded-3xl border border-white/10 overflow-hidden shadow-xl shadow-cyan-500/5 group">
          {/* Glow Effect for Speaking */}
          <div className={cn(
            "absolute inset-0 transition-opacity duration-300",
            activeSpeakers.includes(mainSpeaker.id) || true ? "opacity-100" : "opacity-0"
          )}>
            <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-3xl" />
            <div className="absolute -inset-1 blur-xl bg-cyan-500/10 rounded-[2rem]" />
          </div>

          {/* Avatar Circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-2 border-cyan-500 text-cyan-500 flex items-center justify-center text-3xl font-light tracking-wider shadow-[0_0_30px_rgba(6,182,212,0.3)] bg-[#0f1014]">
              {mainSpeaker.avatar}
            </div>
          </div>

          {/* Labels */}
          <div className="absolute bottom-4 left-4 bg-[#0a0a0a]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
            <span className="text-xs font-medium text-white/90">{mainSpeaker.name}</span>
          </div>

          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 flex items-center justify-center">
            {!isMuted ? <Mic className="w-4 h-4 text-white/80" /> : <MicOff className="w-4 h-4 text-red-500" />}
          </div>
        </div>

        {/* Grid for Others */}
        <div className="grid grid-cols-2 gap-3">
          {others.map(p => (
            <div key={p.id} className="relative aspect-video bg-[#15151a] rounded-2xl border border-white/10 overflow-hidden transition-all hover:border-white/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-10 h-10 rounded-full border flex items-center justify-center text-sm font-medium"
                  style={{ borderColor: p.color, color: p.color, backgroundColor: `${p.color}10` }}
                >
                  {p.avatar}
                </div>
              </div>
              {/* Floating Name Badge - Bottom Left */}
              <div className="absolute bottom-2 left-2 flex flex-col">
                {p.id === 'user-2' && <div className="text-[10px] text-white/50 mb-0.5">You</div>}
                <div className="bg-[#0a0a0a]/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/5 self-start">
                  <span className="text-[10px] text-white/90">{p.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Bottom Control Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-[#15151a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl z-20">
        <button
          onClick={toggleMute}
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
            isMuted ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "bg-white/5 text-white/80 hover:bg-white/10"
          )}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <button
          onClick={() => setCameraOn(!cameraOn)}
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
            !cameraOn ? "bg-white/5 text-white/80 hover:bg-white/10" : "bg-white/10 text-white"
          )}
        >
          {!cameraOn ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>

        <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 text-white/80 hover:bg-white/10 transition-all">
          <Monitor className="w-5 h-5" />
        </button>

        <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 text-white/80 hover:bg-white/10 transition-all">
          <Settings className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-white/10 mx-1" />

        <button
          onClick={leaveCall}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/80 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 transition-all"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}