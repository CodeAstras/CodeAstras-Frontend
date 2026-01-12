import { UserPlus, Crown, Code, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCollab } from '../../context/CollaborationContext';
import { collabApi } from '../../services/collabApi';
import { toast } from 'sonner';

export function ParticipantsList() {
  const { projectId } = useParams();
  const { currentCollaborators, refreshCollaborators } = useCollab();

  const [showInvite, setShowInvite] = useState(false);
  const [inviteInput, setInviteInput] = useState('');
  const [inviteRole, setInviteRole] = useState<'COLLABORATOR' | 'VIEWER'>('COLLABORATOR');
  const [isInviting, setInviting] = useState(false);

  useEffect(() => {
    if (projectId) {
      refreshCollaborators(projectId);
    }
  }, [projectId, refreshCollaborators]);

  // Helper to generate avatar from email/name
  const getAvatar = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  // Helper to generate color (simple hash)
  const getColor = (name: string) => {
    const colors = ['#B043FF', '#2BCBFF', '#3DF6FF', '#666', '#FFB347', '#FF43A1', '#43FFB0'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  };

  const handleInvite = async () => {
    if (!inviteInput || !projectId) {
      toast.error("Please enter an email");
      return;
    }

    try {
      setInviting(true);
      await collabApi.inviteCollaborator(projectId, inviteInput);
      toast.success(`Invite sent to ${inviteInput}`);
      setInviteInput('');
      setShowInvite(false);
    } catch (error: any) {
      console.error("Invite failed", error);
      toast.error(error.message || "Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="w-3 h-3 text-yellow-500" />;
      case 'COLLABORATOR':
        return <Code className="w-3 h-3 text-blue-400" />;
      case 'VIEWER':
        return <Eye className="w-3 h-3 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="border-b border-white/5 bg-[#0f0f0f] h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 flex-shrink-0">
        <div className="text-sm text-white/90">Project Collaborators</div>
        <button className="p-2 hover:bg-white/10 rounded transition-colors" title="Invite user" onClick={() => setShowInvite(true)}>
          <UserPlus className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Participants list */}
      <div className="p-2 space-y-1 overflow-y-auto flex-1">
        {(!Array.isArray(currentCollaborators) || currentCollaborators.length === 0) ? (
          <div className="text-center text-white/30 py-4 text-xs">No collaborators yet</div>
        ) : (

          currentCollaborators.map((participant) => {
            if (!participant) return null; // Safe guard
            const email = participant.email || "Unknown User";
            const color = getColor(email);
            return (
              <div
                key={participant.userId || email}
                className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group"
              >
                {/* Avatar */}
                <div className="relative">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center border text-xs"
                    style={{
                      backgroundColor: `${color}20`,
                      borderColor: color,
                      color: color,
                      fontWeight: '600'
                    }}
                  >
                    {getAvatar(email)}
                  </div>

                  {/* Status indicator - Mock for now unless linked to VoiceContext or OnlineStatusContext */}
                  <div
                    className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-[#0f0f0f] bg-green-500"
                  />
                </div>

                {/* Name and role */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate text-white/90">{participant.email}</div>
                  <div className="flex items-center gap-1.5 text-[10px] text-white/60 uppercase">
                    {getRoleIcon(participant.role)}
                    <span>{participant.role}</span>
                    {participant.status === 'PENDING' && <span className="text-orange-400">(Pending)</span>}
                  </div>
                </div>

                {/* Quick actions (admin only ideally) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 hover:bg-white/10 rounded text-xs text-white/60 hover:text-white">
                    ···
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Invite button */}
      <div className="p-3 border-t border-white/5 flex-shrink-0">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#18181b] rounded-xl shadow-2xl border border-white/10 p-6 w-80 relative">
            <button className="absolute top-2 right-2 text-white/50 hover:text-white" onClick={() => setShowInvite(false)}>&times;</button>
            <div className="mb-4 text-lg font-semibold text-white">Invite to Workspace</div>
            <div className="space-y-3">
              <input
                className="w-full px-3 py-2 rounded bg-[#23232b] text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                placeholder="Email address"
                value={inviteInput}
                onChange={e => setInviteInput(e.target.value)}
              />
              <select
                className="w-full px-3 py-2 rounded bg-[#23232b] text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value as any)}
              >
                <option value="COLLABORATOR">Collaborator</option>
                <option value="VIEWER">Viewer</option>
              </select>
              <button
                disabled={isInviting}
                className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-[#7c3aed] to-[#0ea5e9] rounded-xl hover:shadow-lg hover:shadow-[#7c3aed]/30 transition-all duration-300 text-sm font-semibold text-white disabled:opacity-50"
                onClick={handleInvite}
              >
                {isInviting ? "Sending..." : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}