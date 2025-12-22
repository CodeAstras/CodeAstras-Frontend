import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Editor, { OnMount } from "@monaco-editor/react";

import { connectCodeSocket, sendCodeEdit } from "../../services/wsCode";
import { connectRunSocket, sendRunRequest } from "../../services/wsRun";
import { CodeEditMessage, RunCodeBroadcastMessage } from "../../types/wsTypes";
import { startSession } from "../../services/session";
import { Play, Loader2, Circle, TerminalSquare } from "lucide-react";

interface JwtPayload {
  sub: string;
  email?: string;
  name?: string;
}

type CodeEditorProps = {
  runSignal: number;
  onRunResult: (output: string, exitCode: number | null) => void;
};

export default function CodeEditor({ runSignal, onRunResult }: CodeEditorProps) {
  const { projectId } = useParams();

  const [code, setCode] = useState(
    [
      "# Start coding in CodeAstras 🚀",
      "print('Hello from your workspace!')",
      "",
    ].join("\n")
  );
  const [output, setOutput] = useState("");
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("unknown-user");

  const [sessionReady, setSessionReady] = useState(false);
  const [sessionStarting, setSessionStarting] = useState(false);
  const [sessionCanRetry, setSessionCanRetry] = useState(false);

  const filename = "src/main.py";

  // Timeout ref to fail a run if we don't get output back
  const runTimeoutRef = useRef<number | null>(null);

  // Decode JWT → userId
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setUserId("anonymous");
      return;
    }
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      setUserId(decoded.sub || "unknown-user");
    } catch {
      setUserId("invalid-token-user");
      setError("Failed to decode JWT. Please log in again.");
    }
  }, []);

  // Start Docker session (with retryable bootstrap)
  const attemptStartSession = async () => {
    if (!projectId) return;

    try {
      setSessionStarting(true);
      setSessionReady(false);
      setSessionCanRetry(false);
      console.log("[CodeEditor] Starting session for projectId:", projectId, "token:", localStorage.getItem("access_token")?.slice(0,20));
      const id = await startSession(projectId);
      console.log("[CodeEditor] Session started:", id);
      setSessionReady(true);
      setError(null);
    } catch (err: any) {
      console.error("[CodeEditor] startSession error:", err);
      setSessionReady(false);
      setSessionCanRetry(true);
      const message = err?.message || "Failed to start execution session. Try reloading.";
      setError(message);
    } finally {
      setSessionStarting(false);
    }
  };

  useEffect(() => {
    if (!projectId) return;
    attemptStartSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleRetrySession = () => {
    attemptStartSession();
  };

  // Code WebSocket
  useEffect(() => {
    if (!projectId) return;

    connectCodeSocket(projectId, (msg: CodeEditMessage) => {
      if (msg.userId === userId) return;
      if (msg.path === filename) setCode(msg.content);
    });
  }, [projectId, userId]);

  // Run WebSocket
  useEffect(() => {
    if (!projectId) return;

    // Buffer to accumulate streamed output across RUN_OUTPUT frames
    const runOutputRef = { current: "" } as { current: string };

    connectRunSocket(projectId, (msg: RunCodeBroadcastMessage) => {
      const rawOut = msg.output;
      const code = msg.exitCode ?? null;

      // Clear run timeout if we had one (we'll restart/clear where appropriate)
      if (runTimeoutRef.current) {
        clearTimeout(runTimeoutRef.current);
        runTimeoutRef.current = null;
      }

      // Handle message types explicitly
      if (msg.type === 'RUN_STARTED') {
        // reset buffer
        runOutputRef.current = "";
        setOutput("(Running...)");
        setIsRunning(true);
        setExitCode(null);
        setError(null);
        console.info('[CodeEditor] RUN_STARTED session:', msg.sessionId);
        return;
      }

      if (msg.type === 'RUN_OUTPUT') {
        // Append streamed output
        const appended = (rawOut ?? "");
        runOutputRef.current += appended + (appended.endsWith("\n") ? "" : "\n");
        setOutput(runOutputRef.current.trimEnd());
        // keep running state
        setIsRunning(true);
        console.info('[CodeEditor] RUN_OUTPUT appended:', appended);
        // No onRunResult final call yet, but update workspace so terminal can show
        onRunResult(runOutputRef.current.trimEnd(), null);
        return;
      }

      // RUN_FINISHED
      let finalOutput: string;
      if (rawOut === null || rawOut === undefined) {
        // If backend didn't send a final aggregated output, use buffered output
        finalOutput = runOutputRef.current.trimEnd();
        if (!finalOutput) {
          finalOutput = "(No output produced by the program)";
        }
        console.info('[CodeEditor] RUN_FINISHED used buffer as final output. session:', msg.sessionId);
      } else {
        // Backend sent final output (may be full or partial)
        finalOutput = (rawOut ?? "").trimEnd();
      }

      setOutput(finalOutput);
      setExitCode(code);
      setIsRunning(false);

      // ⬇️ tell Workspace (so Terminal can show it)
      onRunResult(finalOutput, code);

      if (code !== 0) setError(`Process exited with code ${code}`);
      else setError(null);
    });
  }, [projectId, onRunResult]);
  

  // Handle typing

  // Listen for unhandled promise rejections (e.g. browser extension message channel errors)
  useEffect(() => {
    const rejectionHandler = (e: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", e);
      const reason = e?.reason?.message || e?.reason;
      if (typeof reason === 'string' && (reason.includes('async response by returning true') || reason.includes('message channel closed'))) {
        setIsRunning(false);
        setError("A background listener closed before responding (often a browser extension). Try disabling extensions or use incognito.");
      }
    };

    const errorHandler = (event: ErrorEvent) => {
      console.error("Global error:", event.message, event.error, "source:", event.filename, "lineno:", event.lineno);
      const msg = event?.message || "";
      if (typeof msg === 'string' && (msg.includes('async response by returning true') || msg.includes('message channel closed'))) {
        setIsRunning(false);
        setError("A background listener closed before responding (often a browser extension). Try disabling extensions or use incognito.");
      }
    };

    window.addEventListener('unhandledrejection', rejectionHandler);
    window.addEventListener('error', errorHandler);
    return () => {
      window.removeEventListener('unhandledrejection', rejectionHandler);
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  const handleChange = (value: string | undefined) => {
    const updated = value || "";
    setCode(updated);

    if (!projectId) return;
    const message: CodeEditMessage = {
      projectId,
      userId,
      path: filename,
      content: updated,
    };

    try {
      sendCodeEdit(projectId, message);
    } catch (err) {
      console.error(err);
      setError("Failed to send code edit over WebSocket.");
    }
  };

  // Handle Run
  const handleRun = () => {
    if (!projectId) {
      setError("No projectId in URL – cannot run code.");
      return;
    }
    if (!sessionReady) {
      setError("Session is not ready yet. Please wait a moment.");
      return;
    }

    setIsRunning(true);
    setOutput("");
    setExitCode(null);
    setError(null);

    const payload = { projectId, userId, filename, timeoutSeconds: 10 };

    try {
      sendRunRequest(projectId, payload);

      // Start a timeout: if we don't receive run output within (timeoutSeconds + 2s), show a helpful error
      const waitMs = (payload.timeoutSeconds ?? 10) * 1000 + 2000;
      if (runTimeoutRef.current) {
        clearTimeout(runTimeoutRef.current);
      }
      runTimeoutRef.current = window.setTimeout(() => {
        setIsRunning(false);
        setError("No output received from execution engine. The background listener may have closed. Check your browser extensions or try incognito mode.");
      }, waitMs);
    } catch (err: any) {
      console.error(err);
      setIsRunning(false);
      setError(err?.message || "Failed to send run request over WebSocket.");
    }
  };
  useEffect(() => {
    if (!runSignal) return; // ignore initial 0
    handleRun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runSignal]);


  // Monaco theme + mount
  const handleEditorMount: OnMount = (editor, monaco) => {
    monaco.editor.defineTheme("codeastra-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", background: "000000", foreground: "E0E0E0" },
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
        { token: "keyword", foreground: "C586C0", fontStyle: "bold" },
        { token: "number", foreground: "B5CEA8" },
        { token: "string", foreground: "CE9178" },
        { token: "variable", foreground: "9CDCFE" },
        { token: "type", foreground: "4EC9B0" },
        { token: "function", foreground: "DCDCAA" },
        { token: "operator", foreground: "D4D4D4" },
      ],
      colors: {
        "editor.background": "#000000",
        "editor.lineHighlightBackground": "#0a0a0a",
        "editorCursor.foreground": "#00CFFF",
        "editor.selectionBackground": "#1a1a1a",
        "editor.inactiveSelectionBackground": "#151515",
        "editorLineNumber.foreground": "#555555",
        "editorLineNumber.activeForeground": "#bbbbbb",
        "editorIndentGuide.background": "#222222",
        "editorIndentGuide.activeBackground": "#333333",
      },
    });

    monaco.editor.setTheme("codeastra-dark");
  };

  return (
    // ⬅️ h-full so it fits inside Workspace's flex layout
    <div className="w-full h-full text-white flex flex-col font-sans">
      {/* Top Bar */}
{/* <div className="flex items-center justify-between px-6 py-3 bg-[#111218] border-b border-[#1f1f2a] shadow-md">
  <div className="text-xs uppercase tracking-widest text-gray-500">
    CodeAstra · Python IDE
  </div>

  <div className="flex items-center gap-1 text-xs text-gray-400">
    <Circle
      className={`w-2 h-2 ${
        sessionReady ? "text-emerald-400" : "text-yellow-400"
      }`}
      fill="currentColor"
    />
    {sessionReady ? "Session ready" : "Starting session..."}
  </div>
</div> */}



      {/* Error Bar */}
      {error && (
        <div className="px-6 py-2 bg-red-900/70 border-b border-red-600/40 text-xs text-red-200 flex items-center justify-between">
          <div>⚠️ {error}</div>
          {sessionCanRetry && (
            <div className="ml-4">
              <button
                onClick={handleRetrySession}
                disabled={sessionStarting}
                className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs"
              >
                {sessionStarting ? 'Retrying...' : 'Retry'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Editor + Console */}
            {/* Editor area only (console removed) */}
            <div className="flex flex-col flex-1 p-4">
        <div className="flex-1 bg-[#1a1b26] border border-[#2a2b36] rounded-2xl shadow-inner shadow-black/40 overflow-hidden flex flex-col">
          <div className="px-4 py-2 border-b border-[#2a2b36] bg-[#16171f] flex justify-between items-center text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-wide">Editor</span>
              <span className="text-gray-500">· {filename}</span>
            </div>
            <span className="px-2 py-[2px] rounded-full bg-[#111223] border border-[#24263a]">
              Python 3
            </span>
          </div>

          <Editor
            height="100%"
            width="100%"
            defaultLanguage="python"
            value={code}
            theme="codeastra-dark"
            onMount={handleEditorMount}
            onChange={handleChange}
            options={{
              fontSize: 15,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontLigatures: true,
              automaticLayout: true,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              renderLineHighlight: "all",
              smoothScrolling: true,
              cursorBlinking: "smooth",
              bracketPairColorization: { enabled: true },
              guides: { indentation: true, bracketPairs: true },
            }}
          />
        </div>
      </div>

    </div>
  );
}
