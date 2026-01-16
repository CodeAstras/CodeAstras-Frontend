import { useNavigate, useLocation } from "react-router-dom";
import { Code2 } from 'lucide-react';
import { NotificationBell } from "./NotificationBell";

export function DashboardHeader() {
    const navigate = useNavigate();
    const location = useLocation();

    const getLinkClass = (path: string) => {
        const isActive = location.pathname === path;
        return isActive
            ? "px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-[#7c3aed]/20 to-[#0ea5e9]/20 text-white border border-[#7c3aed]/30 transition-all font-medium"
            : "px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all text-white/60";
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-[100] bg-[#0f0f0f]/95 backdrop-blur-md border-b border-white/5 pointer-events-auto isolate">
            <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#0ea5e9] flex items-center justify-center">
                            <Code2 className="w-5 h-5" />
                        </div>
                    </div>
                    <span className="text-xl font-semibold bg-gradient-to-r from-[#7c3aed] to-[#0ea5e9] bg-clip-text text-transparent">
                        CodeAstras
                    </span>
                </button>

                <nav className="flex items-center gap-1">
                    <button onClick={() => navigate('/dashboard')} className={getLinkClass('/dashboard')}>Home</button>
                    <button onClick={() => navigate('/my-projects')} className={getLinkClass('/my-projects')}>My Projects</button>
                    <button onClick={() => navigate('/rooms')} className={getLinkClass('/rooms')}>Rooms</button>
                    <button onClick={() => navigate('/teams')} className={getLinkClass('/teams')}>Teams</button>
                    <button onClick={() => navigate('/friends')} className={getLinkClass('/friends')}>Friends</button>
                </nav>

                <div className="flex items-center gap-3">
                    <NotificationBell />
                    <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#0ea5e9] flex items-center justify-center font-semibold text-white">
                        AC
                    </button>
                </div>
            </div>
        </header>
    );
}
