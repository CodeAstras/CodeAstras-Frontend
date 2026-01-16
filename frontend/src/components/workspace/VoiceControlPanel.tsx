import { Mic, MicOff, PhoneOff, Signal } from "lucide-react";
import { useVoice } from "../../context/VoiceContext";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

export function VoiceControlPanel() {
    const { isConnected, isMuted, toggleMute, leaveCall, activeSpeakers } = useVoice();

    if (!isConnected) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-[#0f0f0f] border border-white/10 p-3 rounded-2xl shadow-2xl shadow-purple-500/20 animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-2">
                <div className="relative">
                    <Signal className="w-5 h-5 text-green-400" />
                    <div className="absolute inset-0 bg-green-400 blur-sm opacity-50 animate-pulse" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-white">Voice Connected</span>
                    <span className="text-[10px] text-white/40">
                        {activeSpeakers.length > 0 ? `${activeSpeakers.length} speaking` : "Channel active"}
                    </span>
                </div>
            </div>

            <div className="h-8 w-px bg-white/10" />

            {/* Controls */}
            <div className="flex items-center gap-2">
                <Button
                    onClick={toggleMute}
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "rounded-xl w-10 h-10 transition-all",
                        isMuted
                            ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                            : "bg-white/5 text-white hover:bg-white/10"
                    )}
                >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>

                <Button
                    onClick={leaveCall}
                    variant="destructive"
                    size="icon"
                    className="rounded-xl w-10 h-10 bg-red-500/80 hover:bg-red-500 shadow-lg shadow-red-500/20"
                >
                    <PhoneOff className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
