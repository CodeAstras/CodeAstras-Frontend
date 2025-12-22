import { UserPlus, Crown, Code, Eye } from 'lucide-react';


import { useState } from 'react';

export function ParticipantsList() {
  const [participants, setParticipants] = useState([
    { id: 1, name: 'You', avatar: 'YO', role: 'Owner', status: 'online', color: '#B043FF' },
    { id: 2, name: 'Alex Chen', avatar: 'AC', role: 'Editor', status: 'online', color: '#2BCBFF' },
    { id: 3, name: 'Sarah Kim', avatar: 'SK', role: 'Editor', status: 'online', color: '#3DF6FF' },
    { id: 4, name: 'Mike Ross', avatar: 'MR', role: 'Viewer', status: 'away', color: '#666' },
  ]);

  const [showInvite, setShowInvite] = useState(false);
  const [inviteInput, setInviteInput] = useState('');
  const [inviteRole, setInviteRole] = useState('Collaborator');

  // Helper to generate avatar from name
  const getAvatar = (name: string) => {
    const parts = name.split(' ');
    return parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2).toUpperCase();
  };

  // Helper to generate color (simple hash)
  const getColor = (name: string) => {
    const colors = ['#B043FF', '#2BCBFF', '#3DF6FF', '#666', '#FFB347', '#FF43A1', '#43FFB0'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  };

  const handleAddCollaborator = () => {
    if (!inviteInput) return;
    setParticipants([
      ...participants,
      {
        id: Date.now(),
        name: inviteInput,
        avatar: getAvatar(inviteInput),
        role: inviteRole === 'Collaborator' ? 'Editor' : 'Viewer',
        status: 'online',
        color: getColor(inviteInput),
      },
    ]);
    setInviteInput('');
    setInviteRole('Collaborator');
    setShowInvite(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Owner':
        return <Crown className="w-3 h-3" />;
      case 'Editor':
        return <Code className="w-3 h-3" />;
      case 'Viewer':
        return <Eye className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="border-b border-white/5 bg-[#0f0f0f]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="text-sm text-white/90">Project Alpha</div>
        <button className="p-2 hover:bg-white/10 rounded transition-colors" title="Invite user" onClick={() => setShowInvite(true)}>
          <UserPlus className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Participants list */}
      <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group"
          >
            {/* Avatar */}
            <div className="relative">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center border-2 text-sm"
                style={{
                  backgroundColor: `${participant.color}20`,
                  borderColor: participant.color,
                  color: participant.color,
                  fontWeight: '600'
                }}
              >
                {participant.avatar}
              </div>
              
              {/* Status indicator */}
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0f0f0f] ${
                  participant.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              />
            </div>

            {/* Name and role */}
            <div className="flex-1 min-w-0">
              <div className="text-sm truncate text-white/90">{participant.name}</div>
              <div className="flex items-center gap-1.5 text-xs text-white/60">
                {getRoleIcon(participant.role)}
                <span>{participant.role}</span>
              </div>
            </div>

            {/* Quick actions */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 hover:bg-white/10 rounded text-xs text-white/60 hover:text-white">
                ···
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Invite button */}
      <div className="p-3 border-t border-white/5">
        <button
          className="w-full px-4 py-2 bg-gradient-to-r from-[#7c3aed] to-[#0ea5e9] rounded-xl hover:shadow-lg hover:shadow-[#7c3aed]/30 transition-all duration-300 text-sm flex items-center justify-center gap-2"
          onClick={() => setShowInvite(true)}
        >
          <UserPlus className="w-4 h-4" />
          Invite to Workspace
        </button>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#18181b] rounded-xl shadow-lg p-6 w-80 relative">
            <button className="absolute top-2 right-2 text-white/50 hover:text-white" onClick={() => setShowInvite(false)}>&times;</button>
            <div className="mb-4 text-lg font-semibold text-white">Invite to Workspace</div>
            <div className="space-y-3">
              <input
                className="w-full px-3 py-2 rounded bg-[#23232b] text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                placeholder="Email or Username"
                value={inviteInput}
                onChange={e => setInviteInput(e.target.value)}
              />
              <select
                className="w-full px-3 py-2 rounded bg-[#23232b] text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] appearance-none"
                style={{ backgroundColor: '#23232b' }}
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
              >
                <option className="bg-[#23232b] text-white" value="Collaborator">Collaborator</option>
                <option className="bg-[#23232b] text-white" value="Viewer">Viewer</option>
              </select>
              <button
                className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-[#7c3aed] to-[#0ea5e9] rounded-xl hover:shadow-lg hover:shadow-[#7c3aed]/30 transition-all duration-300 text-sm font-semibold text-white"
                onClick={handleAddCollaborator}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}