import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { IntegrationsSidebar } from '../components/workspace/IntegrationsSidebar';
import { FileExplorer } from '../components/workspace/FileExplorer';
import { EditorTabs } from '../components/workspace/EditorTabs';
import CodeEditor from '../components/workspace/CodeEditor';
import { Terminal } from '../components/workspace/Terminal';
import { VideoPanel } from '../components/workspace/VideoPanel';
import { ParticipantsList } from '../components/workspace/ParticipantsList';
import { ChatPanel } from '../components/workspace/ChatPanel';
import { CosmicStars } from '../components/workspace/CosmicStars';
import { MessageCircle, Video, Users, Sparkles, Settings } from 'lucide-react';

export default function Workspace() {
  // --- UI state ---
  const [fileExplorerOpen, setFileExplorerOpen] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(false);

  const [videoMode, setVideoMode] = useState<'video' | 'audio'>('video');

  type RightTool = 'video' | 'chat' | 'collaborators' | 'ai' | 'settings';
  const [activeTool, setActiveTool] = useState<RightTool>('video');

  const [runSignal, setRunSignal] = useState(0);

  const [runOutput, setRunOutput] = useState('');
const [runExitCode, setRunExitCode] = useState<number | null>(null);

  // --- resizable right panel ---
  const [rightPanelWidth, setRightPanelWidth] = useState(320);

  const handleRightDragMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  
    const startX = e.clientX;
    const startWidth = rightPanelWidth;
  
    // Change cursor globally
    document.body.style.cursor = "col-resize";
  
    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.clientX;
      let newWidth = startWidth + delta;
  
      // clamp width between 260px and 520px
      newWidth = Math.min(Math.max(newWidth, 260), 520);
  
      setRightPanelWidth(newWidth);
    };
  
    const onMouseUp = () => {
      // Reset cursor
      document.body.style.cursor = "default";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };
  

  // --- project name from navigation state ---
  const location = useLocation();
  const state = location.state as { projectName?: string } | null;
  const projectName = state?.projectName ?? 'CodeAstra';

  // --- Layout ---
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative">
      {/* Background effects */}
      <CosmicStars />
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#7c3aed] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#0ea5e9] rounded-full blur-[150px]" />
      </div>

      {/* ---------------- Main workspace container ---------------- */}
      <div className="flex h-screen overflow-hidden">
        {/* ---------------- Left - IDE Section ---------------- */}
        <div className="flex flex-1 min-w-0 relative">
          {/* Integrations sidebar */}
          <div className="hidden md:block">
            <IntegrationsSidebar />
          </div>

          {/* File Explorer */}
          {fileExplorerOpen && (
            <div className="hidden md:block">
              <FileExplorer onClose={() => setFileExplorerOpen(false)} />
            </div>
          )}

          {/* Editor area */}
          <div className="flex-1 min-w-0 flex flex-col relative bg-[#0a0a0a]">
          <EditorTabs
  projectName={projectName}
  onRun={() => {
    setTerminalOpen(true);          // ⬅️ open terminal panel
    setRunSignal(prev => prev + 1); // ⬅️ trigger CodeEditor run
  }}
/>



            {/* Main code editor */}
            <div className="flex-1 relative overflow-hidden">
  <CodeEditor
    runSignal={runSignal}
    onRunResult={(output, exitCode) => {
      setRunOutput(output);
      setRunExitCode(exitCode);
    }}
  />
</div>



            {/* Terminal */}
            <Terminal
  isOpen={terminalOpen}
  onToggle={() => setTerminalOpen(!terminalOpen)}
  output={runOutput}
  exitCode={runExitCode}
/>

          </div>
        </div>

        {/* ---------------- Divider / Resize handle ---------------- */}
        <div
          className="w-1 cursor-col-resize bg-white/5 hover:bg-white/20"
          onMouseDown={handleRightDragMouseDown}
        />

        {/* ---------------- Right Tools Section ---------------- */}
        <div
          className="flex h-full flex-shrink-0 bg-[#0f0f0f] border-l border-white/5"
          style={{ width: rightPanelWidth }}
        >
          {/* Active content area */}
          <div className="flex-1 h-full flex flex-col overflow-hidden">
            {activeTool === 'video' && <VideoPanel mode={videoMode} onModeChange={setVideoMode} />}

            {activeTool === 'chat' && (
              <div className="flex-1 flex flex-col">
                <ChatPanel />
              </div>
            )}

            {activeTool === 'collaborators' && (
              <div className="flex-1 flex flex-col">
                <div className="px-4 py-2 border-b border-white/10 text-sm text-white/60">
                  Collaborators
                </div>
                <ParticipantsList />
              </div>
            )}

            {activeTool === 'ai' && (
              <div className="flex-1 p-4 text-sm text-white/70">
                <p className="mb-2 font-semibold">AI Assistant</p>
                <p className="text-white/50">
                  Hook your AI helper UI here (chat, suggestions, refactor hints, etc.).
                </p>
              </div>
            )}

            {activeTool === 'settings' && (
              <div className="flex-1 p-4 text-sm text-white/70">
                <p className="mb-2 font-semibold">Workspace Settings</p>
                <p className="text-white/50">
                  You can add theme, layout, and collaboration settings here later.
                </p>
              </div>
            )}
          </div>

          {/* Icon rail (extreme right) */}
          <div className="flex flex-col items-center gap-4 w-14 py-4 border-l border-white/10">
            <button
              type="button"
              onClick={() => setActiveTool('video')}
              className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                activeTool === 'video'
                  ? 'bg-gradient-to-br from-[#7c3aed]/30 to-[#0ea5e9]/30 text-white'
                  : 'text-white/50 hover:bg-white/5'
              }`}
              title="Video call"
            >
              <Video className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('chat')}
              className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                activeTool === 'chat'
                  ? 'bg-gradient-to-br from-[#7c3aed]/30 to-[#0ea5e9]/30 text-white'
                  : 'text-white/50 hover:bg-white/5'
              }`}
              title="Chat"
            >
              <MessageCircle className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('collaborators')}
              className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                activeTool === 'collaborators'
                  ? 'bg-gradient-to-br from-[#7c3aed]/30 to-[#0ea5e9]/30 text-white'
                  : 'text-white/50 hover:bg-white/5'
              }`}
              title="Collaborators"
            >
              <Users className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('ai')}
              className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                activeTool === 'ai'
                  ? 'bg-gradient-to-br from-[#7c3aed]/30 to-[#0ea5e9]/30 text-white'
                  : 'text-white/50 hover:bg-white/5'
              }`}
              title="AI Assistant"
            >
              <Sparkles className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('settings')}
              className={`mt-auto p-2 rounded-lg flex items-center justify-center transition-all ${
                activeTool === 'settings'
                  ? 'bg-gradient-to-br from-[#7c3aed]/30 to-[#0ea5e9]/30 text-white'
                  : 'text-white/50 hover:bg-white/5'
              }`}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- Mobile terminal toggle ---------------- */}
      <button
        onClick={() => setTerminalOpen(!terminalOpen)}
        className="lg:hidden fixed bottom-4 left-4 z-40 w-12 h-12 bg-gradient-to-r from-[#7c3aed] to-[#0ea5e9] rounded-full shadow-lg flex items-center justify-center"
        aria-label="Toggle terminal"
      >
        {terminalOpen ? '×' : '$'}
      </button>
    </div>
  );
}
