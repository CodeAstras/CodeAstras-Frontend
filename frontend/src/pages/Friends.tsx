import { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { Users, UserPlus, MessageCircle, Mail } from 'lucide-react';
import { CosmicStars } from "../components/workspace/CosmicStars";
import { DashboardHeader } from "../components/DashboardHeader";
import { collabApi } from '../services/collabApi';

type Friend = {
    userId: string;
    name: string;
    email: string;
    status: 'online' | 'offline';
    avatar: string;
    color: string;
};

export default function Friends() {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(false);

    // Helpers (Reused)
    const getColor = (str: string) => {
        const colors = ['#7c3aed', '#0ea5e9', '#06b6d4', '#8b5cf6', '#ec4899', '#10b981'];
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
        return colors[hash % colors.length];
    };
    const getAvatar = (email: string) => email.substring(0, 2).toUpperCase();

    const fetchFriends = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            let myId = "";
            if (token) {
                const decoded: any = jwtDecode(token);
                myId = decoded.userId || decoded.sub;
            }

            // Fetch recent projects first
            // Note: Ideally we'd have a specific /friends API, but we're aggregating from projects as per Dashboard logic
            const res = await fetch("http://localhost:8080/api/projects", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return; // Handle quietly on this page for now

            const projects = await res.json();
            const projectsToCheck = projects.slice(0, 10); // Check top 10 projects

            const uniqueFriends = new Map<string, Friend>();

            for (const project of projectsToCheck) {
                try {
                    const collabs = await collabApi.getProjectCollaborators(project.id);
                    collabs.forEach(c => {
                        if (c.userId !== myId && !uniqueFriends.has(c.userId)) {
                            uniqueFriends.set(c.userId, {
                                userId: c.userId,
                                email: c.email,
                                name: c.email.split('@')[0],
                                status: 'offline',
                                avatar: getAvatar(c.email),
                                color: getColor(c.email)
                            });
                        }
                    });
                } catch (e) {
                    // Ignore project errors
                }
            }
            setFriends(Array.from(uniqueFriends.values()));

        } catch (error) {
            console.error("Error loading friends", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    return (
        <main className="pt-24 pb-16 px-6 max-w-[1200px] mx-auto relative z-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Friends & Collaborators</h1>
                    <p className="text-white/50">People you have coded with recently</p>
                </div>
                <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Add Friend
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-white/40">Loading network...</div>
            ) : friends.length === 0 ? (
                <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl h-[400px] flex flex-col items-center justify-center gap-4 text-center">
                    <div className="text-white/40 font-medium text-lg">No friends found yet</div>
                    <div className="text-sm text-white/20">Collaborate in projects to add friends automatically</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {friends.map((friend) => {
                        const displayName = friend.name || friend.email.split('@')[0];
                        const displayEmail = friend.email;
                        const showEmail = displayName.toLowerCase().startsWith('user ');

                        return (
                            <div
                                key={friend.userId || friend.email}
                                className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-5 hover:border-[#ec4899]/30 transition-all duration-300 group hover:shadow-xl hover:shadow-[#ec4899]/5"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center font-semibold text-lg uppercase"
                                                style={{ backgroundColor: `${friend.color}20`, color: friend.color }}
                                            >
                                                {friend.avatar}
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0f0f0f] ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white/90">
                                                {showEmail ? displayEmail : displayName}
                                            </div>
                                            <div className="text-xs text-white/40 flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {friend.email}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-6">
                                    <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2">
                                        <MessageCircle className="w-4 h-4 text-white/60" />
                                        Message
                                    </button>
                                    <button className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white">
                                        <Users className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
