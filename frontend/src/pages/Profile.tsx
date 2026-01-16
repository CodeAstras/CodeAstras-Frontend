import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Award,
  Zap,
  Settings,
  TrendingUp,
  LogOut,
  MapPin,
  Mail,
  Calendar,
  Code2,
  Users,
  Flame,
  GitBranch,
  Lock,
  Shield,
  Mic,
  Volume2,
  Palette,
  Chrome,
  Star,
  Target,
  BookOpen,
  Video,
  Trophy,
  Moon,
  Github,
  ChevronRight,
  Edit3,
  Camera,
} from 'lucide-react';
import { CosmicStars } from "../components/workspace/CosmicStars";


type TabView = 'profile' | 'badges' | 'streaks' | 'contributions' | 'settings' | 'preferences';

export default function Profile() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabView>('profile');
  const [editingBio, setEditingBio] = useState(false);

  // User data
  const userData = {
    name: 'Alex Chen',
    username: '@dev_astro',
    bio: 'Full-stack developer. Building cool things in the cosmos. 🚀',
    location: 'San Francisco, CA',
    email: 'alex.chen@codeastra.dev',
    joinDate: 'January 2024',
    avatar: 'AC',
    color: '#7c3aed',
  };

  // Stats
  const stats = [
    { label: 'Projects', value: 24, icon: Code2, color: '#7c3aed' },
    { label: 'Rooms Joined', value: 156, icon: Users, color: '#0ea5e9' },
    { label: 'Contributions', value: 1247, icon: GitBranch, color: '#06b6d4' },
  ];

  const sidebarItems = [
    { id: 'profile' as TabView, label: 'Profile', icon: User },
    { id: 'badges' as TabView, label: 'Badges', icon: Award },
    { id: 'streaks' as TabView, label: 'Streaks', icon: Flame },
    { id: 'contributions' as TabView, label: 'Contributions', icon: TrendingUp },
    { id: 'settings' as TabView, label: 'Settings', icon: Settings },
    { id: 'preferences' as TabView, label: 'Preferences', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* Cosmic background */}
      <CosmicStars />

      {/* Subtle background gradients */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#7c3aed] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[#0ea5e9] rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-white/5">
        <div className="px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#0ea5e9] flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#0ea5e9] blur-md opacity-50" />
            </div>
            <span className="text-sm text-white/60">CodeAstras</span>
          </button>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate('/team')}
              className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              Team
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex pt-16 min-h-screen">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-[#0f0f0f] border-r border-white/5 p-4 fixed left-0 top-16 bottom-0 overflow-y-auto z-40">
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === item.id
                    ? 'bg-gradient-to-r from-[#7c3aed]/20 to-[#0ea5e9]/20 border border-[#7c3aed]/50 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}

            <div className="pt-4 mt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Log Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8 relative z-10">
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              {/* Profile Header */}
              <div className="bg-[#0f0f0f] border border-white/5 rounded-3xl overflow-hidden">
                {/* Banner */}
                <div className="h-40 bg-[#0a0a0a] relative overflow-hidden">
                  {/* Cosmic gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed]/30 via-[#0ea5e9]/20 to-[#7c3aed]/30" />

                  {/* Grid pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle at 2px 2px, rgba(124,58,237,0.4) 1px, transparent 0)',
                        backgroundSize: '32px 32px',
                      }}
                    />
                  </div>

                  {/* Glowing orbs */}
                  <div className="absolute top-0 left-1/4 w-32 h-32 bg-[#7c3aed] rounded-full blur-3xl opacity-30" />
                  <div className="absolute bottom-0 right-1/3 w-40 h-40 bg-[#0ea5e9] rounded-full blur-3xl opacity-20" />

                  {/* Stars */}
                  <div className="absolute inset-0">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          opacity: Math.random() * 0.7 + 0.3,
                          animationDelay: `${Math.random() * 3}s`,
                          animationDuration: `${Math.random() * 2 + 2}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="px-8 pb-8">
                  <div className="flex items-end gap-6 -mt-16 mb-6">
                    {/* Avatar */}
                    <div className="relative group">
                      <div
                        className="w-32 h-32 rounded-2xl flex items-center justify-center text-3xl font-bold border-4 border-[#0f0f0f] relative z-10"
                        style={{ backgroundColor: `${userData.color}30`, color: userData.color }}
                      >
                        {userData.avatar}
                      </div>
                      <div
                        className="absolute inset-0 rounded-2xl blur-xl opacity-70"
                        style={{ backgroundColor: userData.color }}
                      />
                      <button className="absolute bottom-2 right-2 p-2 bg-[#0f0f0f] border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 pt-8">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h1 className="text-3xl font-bold mb-1">{userData.name}</h1>
                          <p className="text-lg text-white/60">{userData.username}</p>
                        </div>
                        <button className="px-4 py-2 bg-gradient-to-r from-[#7c3aed] to-[#0ea5e9] rounded-xl hover:shadow-lg hover:shadow-[#7c3aed]/30 transition-all flex items-center gap-2">
                          <Edit3 className="w-4 h-4" />
                          Edit Profile
                        </button>
                      </div>

                      <p className="text-white/70 mb-4 max-w-2xl">{userData.bio}</p>

                      <div className="flex items-center gap-6 text-sm text-white/60">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {userData.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {userData.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Joined {userData.joinDate}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-5 gap-4">
                    {stats.map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div
                          key={stat.label}
                          className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all group"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}20` }}>
                              <Icon className="w-5 h-5" style={{ color: stat.color }} />
                            </div>
                          </div>
                          <div className="text-2xl font-bold mb-1">{stat.value}</div>
                          <div className="text-sm text-white/60">{stat.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="bg-[#0f0f0f] border border-white/5 rounded-3xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-[#7c3aed]" />
                  Recent Activity
                </h2>

                <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl h-[400px] flex flex-col items-center justify-center gap-4 text-center">
                  <div className="text-white/40 font-medium text-lg">Coming Soon</div>
                  <div className="text-sm text-white/20">We are tracking your coding journey across the cosmos</div>
                </div>
              </div>
            </div>
          )}

          {/* BADGES TAB */}
          {activeTab === 'badges' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Award className="w-8 h-8 text-[#7c3aed]" />
                  Achievement Badges
                </h1>
                <p className="text-white/60">Unlock rewards as you code</p>
              </div>

              <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl h-[400px] flex flex-col items-center justify-center gap-4 text-center">
                <div className="text-white/40 font-medium text-lg">Coming Soon</div>
                <div className="text-sm text-white/20">Badges and achievements system is under development</div>
              </div>
            </div>
          )}

          {/* STREAKS TAB */}
          {activeTab === 'streaks' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Flame className="w-8 h-8 text-[#f59e0b]" />
                  Coding Streaks
                </h1>
                <p className="text-white/60">Keep the fire burning! 🔥</p>
              </div>

              <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl h-[400px] flex flex-col items-center justify-center gap-4 text-center">
                <div className="text-white/40 font-medium text-lg">Coming Soon</div>
                <div className="text-sm text-white/20">Daily coding streaks and rewards are on the way</div>
              </div>
            </div>
          )}

          {/* CONTRIBUTIONS TAB */}
          {activeTab === 'contributions' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <GitBranch className="w-8 h-8 text-[#7c3aed]" />
                  Contribution Graph
                </h1>
              </div>

              <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl h-[400px] flex flex-col items-center justify-center gap-4 text-center">
                <div className="text-white/40 font-medium text-lg">Coming Soon</div>
                <div className="text-sm text-white/20">Visualize your coding activity and impact</div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Settings className="w-8 h-8 text-[#7c3aed]" />
                  Account Settings
                </h1>
                <p className="text-white/60">Manage your account and security</p>
              </div>

              <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl h-[400px] flex flex-col items-center justify-center gap-4 text-center">
                <div className="text-white/40 font-medium text-lg">Coming Soon</div>
                <div className="text-sm text-white/20">Account settings and security controls are under development</div>
              </div>
            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Palette className="w-8 h-8 text-[#7c3aed]" />
                  Preferences
                </h1>
                <p className="text-white/60">Customize your CodeAstras experience</p>
              </div>

              <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl h-[400px] flex flex-col items-center justify-center gap-4 text-center">
                <div className="text-white/40 font-medium text-lg">Coming Soon</div>
                <div className="text-sm text-white/20">Advanced customization options are coming soon</div>
              </div>
            </div>
          )}

        </main >
      </div >
    </div >
  );
}
