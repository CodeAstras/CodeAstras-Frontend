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
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");

  const [runSignal, setRunSignal] = useState(0);
  const [runOutput, setRunOutput] = useState("");
  const [runExitCode, setRunExitCode] = useState<number | null>(null);

  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [leftPanelWidth, setLeftPanelWidth] = useState(250);

  type RightTool = "video" | "chat" | "collaborators" | "ai" | "settings";
  const [activeTool, setActiveTool] = useState<RightTool>("video");

  /* Project Name Management */
  const location = useLocation();
  const state = location.state as { projectName?: string } | null;
  // Initialize with passed state, or "Loading..." (or empty) to prevent flash of wrong name
  const [projectName, setProjectName] = useState<string>(state?.projectName || "Loading...");

  useEffect(() => {
    // If name is missing (e.g. direct URL load), fetch it
    const fetchProjectName = async () => {
      if (!projectId) return;
      try {
        // If we already have it from nav state, don't refetch immediately unless we want to ensure freshness
        // But for this requirement, if it's "Loading..." or we just want to be sure:
        if (projectName === "Loading..." || !state?.projectName) {
          const res = await api.get(`/projects/${projectId}`);
          setProjectName(res.data.name);
        }
      } catch (err) {
        console.error("Failed to fetch project details", err);
        setProjectName("CodeAstras Workspace");
      }
    };

    fetchProjectName();
  }, [projectId]);

  // ---------------- API calls ----------------

  const loadTree = async () => {
    if (!projectId) return;
    const res = await api.get(`/projects/${projectId}/files/tree`);
    setFileTree(res.data);
  };

  const openFile = async (path: string) => {
    if (!projectId) return;

    if (!openFiles.includes(path)) {
      setOpenFiles((prev) => [...prev, path]);
    }

    const res = await api.get(`/projects/${projectId}/file`, {
      params: { path },
    });

    setActiveFile(path);
    setFileContent(res.data.content ?? "");
  };

  const closeFile = (path: string) => {
    setOpenFiles((prev) => prev.filter((p) => p !== path));
    if (activeFile === path) {
      const remaining = openFiles.filter((p) => p !== path);
      if (remaining.length > 0) {
        // Switch to the last opened file
        openFile(remaining[remaining.length - 1]);
      } else {
        setActiveFile(null);
        setFileContent("");
      }
    }
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

  // Resize handler - RIGHT
  const handleRightDragMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightPanelWidth;

    document.body.style.cursor = "col-resize";

    const onMove = (ev: MouseEvent) => {
      const delta = startX - ev.clientX; // Dragging left increases width
      setRightPanelWidth(Math.min(Math.max(startWidth + delta, 260), 600));
    };

    const onUp = () => {
      document.body.style.cursor = "default";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // Resize handler - LEFT
  const handleLeftDragMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftPanelWidth;

    document.body.style.cursor = "col-resize";

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX; // Dragging right increases width
      setLeftPanelWidth(Math.min(Math.max(startWidth + delta, 200), 500));
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
          <div className="hidden md:block h-full">
            <IntegrationsSidebar />
          </div>

          {fileExplorerOpen && (
            <div style={{ width: leftPanelWidth }} className="flex-shrink-0 flex">
              <div className="flex-1 overflow-hidden">
                <FileExplorer
                  tree={fileTree}
                  onSelect={openFile}
                  onCreate={createEntry}
                  onDelete={deleteEntry}
                  onClose={() => setFileExplorerOpen(false)}
                />
              </div>
              <div
                className="w-1 cursor-col-resize hover:bg-white/20 active:bg-blue-500/50 transition-colors"
                onMouseDown={handleLeftDragMouseDown}
              />
            </div>
          )}

          <div className="flex-1 min-w-0 flex flex-col">
            <EditorTabs
              projectName={projectName}
              files={openFiles}
              activeFile={activeFile}
              onSelect={(path) => {
                setActiveFile(path);
                // We also need to fetch content if we just switched back to it
                // Ideally we cache content, but for now let's re-fetch or rely on existing state if valid?
                // Actually, openFile handles fetching. Let's reuse openFile but maybe optimize later.
                openFile(path);
              }}
              onClose={closeFile}
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
          className="w-1 cursor-col-resize bg-white/5 hover:bg-white/20 active:bg-blue-500/50 transition-colors"
          onMouseDown={handleRightDragMouseDown}
        />

        <div
          className="flex h-full flex-shrink-0 bg-[#0f0f0f] border-l border-white/5"
          style={{ width: rightPanelWidth }}
        >
          <div className="flex-1 overflow-hidden">
            {activeTool === "video" && <VideoPanel mode="video" onModeChange={() => { }} />}
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
