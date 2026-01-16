import { Users, Plus, UserPlus } from 'lucide-react';
import { CosmicStars } from "../components/workspace/CosmicStars";
import { DashboardHeader } from "../components/DashboardHeader";

export default function Teams() {
    // Mock Teams Data
    const teams: any[] = [];

    return (
        <main className="pt-24 pb-16 px-6 max-w-[1800px] mx-auto relative z-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Your Teams</h1>
                    <p className="text-white/50">Manage your squads and workspace access</p>
                </div>
                <button
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Create Team
                </button>
            </div>

            {teams.length === 0 ? (
                <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl h-[400px] flex flex-col items-center justify-center gap-4 text-center">
                    <div className="text-white/40 font-medium text-lg">No teams created yet</div>
                    <div className="text-sm text-white/20">Create a team to organize projects and members</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Team list mapping */}
                </div>
            )}
        </main>
    );
}
