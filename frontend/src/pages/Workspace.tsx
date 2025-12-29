import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";

import { IntegrationsSidebar } from "../components/workspace/IntegrationsSidebar";
import { FileExplorer } from "../components/workspace/FileExplorer";
import { EditorTabs } from "../components/workspace/EditorTabs";
import CodeEditor from "../components/workspace/CodeEditor";
import { Terminal } from "../components/workspace/Terminal";
import { VideoPanel } from "../components/workspace/VideoPanel";
import { ParticipantsList } from "../components/workspace/ParticipantsList";
import { ChatPanel } from "../components/workspace/ChatPanel";
import { CosmicStars } from "../components/workspace/CosmicStars";
import { MessageCircle, Video, Users, Sparkles, Settings } from "lucide-react";

type FileNode = {
  name: string;
  path: string;
  type: "FILE" | "FOLDER";
  children?: FileNode[];
};

/* ✅ FIXED AXIOS INSTANCE (DO NOT REMOVE) */
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function Workspace() {
  const { projectId } = useParams();

  const [fileExplorerOpen, setFileExplorerOpen] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(false);

  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");

  const [runSignal, setRunSignal] = useState(0);
  const [runOutput, setRunOutput] = useState("");
  const [runExitCode, setRunExitCode] = useState<number | null>(null);

  const [rightPanelWidth, setRightPanelWidth] = useState(320);

  type RightTool = "video" | "chat" | "collaborators" | "ai" | "settings";
  const [activeTool, setActiveTool] = useState<RightTool>("video");

  const location = useLocation();
  const state = location.state as { projectName?: string } | null;
  const projectName = state?.projectName ?? "CodeAstra";

  // ---------------- API calls ----------------

  const loadTree = async () => {
    if (!projectId) return;
    const res = await api.get(`/projects/${projectId}/files/tree`);
    setFileTree(res.data);
  };

  const openFile = async (path: string) => {
    if (!projectId) return;

    const res = await api.get(`/projects/${projectId}/file`, {
      params: { path },
    });

    setActiveFile(path);
    setFileContent(res.data.content ?? "");
  };

  const saveFile = async (content: string) => {
  if (!projectId || !activeFile) return;

  setFileContent(content);

  await api.put(
    `/projects/${projectId}/file`,
    content,
    {
      params: { path: activeFile },
      headers: {
        "Content-Type": "text/plain",
      },
    }
  );
};


  const createEntry = async (path: string, type: "FILE" | "FOLDER") => {
    if (!projectId) return;

    await api.post(`/projects/${projectId}/files`, {
      path,
      type,
    });

    await loadTree();
  };

  const deleteEntry = async (path: string) => {
    if (!projectId) return;

    await api.delete(`/projects/${projectId}/file`, {
      params: { path },
    });

    if (activeFile === path) {
      setActiveFile(null);
      setFileContent("");
    }

    await loadTree();
  };

  // Load tree initially
  useEffect(() => {
    loadTree();
  }, [projectId]);

  // Resize handler
  const handleRightDragMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightPanelWidth;

    document.body.style.cursor = "col-resize";

    const onMove = (ev: MouseEvent) => {
      const delta = startX - ev.clientX;
      setRightPanelWidth(Math.min(Math.max(startWidth + delta, 260), 520));
    };

    const onUp = () => {
      document.body.style.cursor = "default";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative">
      <CosmicStars />

      <div className="flex h-screen overflow-hidden">
        <div className="flex flex-1 min-w-0">
          <div className="hidden md:block">
            <IntegrationsSidebar />
          </div>

          {fileExplorerOpen && (
            <FileExplorer
              tree={fileTree}
              onSelect={openFile}
              onCreate={createEntry}
              onDelete={deleteEntry}
              onClose={() => setFileExplorerOpen(false)}
            />
          )}

          <div className="flex-1 min-w-0 flex flex-col">
            <EditorTabs
              projectName={projectName}
              onRun={() => {
                setTerminalOpen(true);
                setRunSignal((v) => v + 1);
              }}
            />

            <div className="flex-1 overflow-hidden">
              <CodeEditor
                filePath={activeFile}
                content={fileContent}
                onChange={saveFile}
                runSignal={runSignal}
                onRunResult={(out, code) => {
                  setRunOutput(out);
                  setRunExitCode(code);
                }}
              />
            </div>

            <Terminal
              isOpen={terminalOpen}
              onToggle={() => setTerminalOpen(!terminalOpen)}
              output={runOutput}
              exitCode={runExitCode}
            />
          </div>
        </div>

        <div
          className="w-1 cursor-col-resize bg-white/5 hover:bg-white/20"
          onMouseDown={handleRightDragMouseDown}
        />

        <div
          className="flex h-full flex-shrink-0 bg-[#0f0f0f] border-l border-white/5"
          style={{ width: rightPanelWidth }}
        >
          <div className="flex-1 overflow-hidden">
            {activeTool === "video" && <VideoPanel mode="video" onModeChange={() => {}} />}
            {activeTool === "chat" && <ChatPanel />}
            {activeTool === "collaborators" && <ParticipantsList />}
            {activeTool === "ai" && <div className="p-4 text-white/70">AI Assistant</div>}
            {activeTool === "settings" && <div className="p-4 text-white/70">Settings</div>}
          </div>

          <div className="flex flex-col items-center gap-4 w-14 py-4 border-l border-white/10">
            <button onClick={() => setActiveTool("video")}><Video /></button>
            <button onClick={() => setActiveTool("chat")}><MessageCircle /></button>
            <button onClick={() => setActiveTool("collaborators")}><Users /></button>
            <button onClick={() => setActiveTool("ai")}><Sparkles /></button>
            <button onClick={() => setActiveTool("settings")}><Settings /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
