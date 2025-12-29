import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Editor, { OnMount } from "@monaco-editor/react";

import { connectCodeSocket, sendCodeEdit } from "../../services/wsCode";
import { connectRunSocket, sendRunRequest } from "../../services/wsRun";
import { CodeEditMessage, RunCodeBroadcastMessage } from "../../types/wsTypes";
import { startSession } from "../../services/session";

interface JwtPayload {
  sub: string;
  email?: string;
  name?: string;
}

type CodeEditorProps = {
  filePath: string | null;
  content: string;
  onChange: (value: string) => void;
  runSignal: number;
  onRunResult: (output: string, exitCode: number | null) => void;
};

export default function CodeEditor({
  filePath,
  content,
  onChange,
  runSignal,
  onRunResult,
}: CodeEditorProps) {
  const { projectId } = useParams();

  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState("unknown-user");
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionStarting, setSessionStarting] = useState(false);

  const runTimeoutRef = useRef<number | null>(null);
  const codeSocketConnected = useRef(false);
  const runSocketConnected = useRef(false);

  // --------------------------------------------------
  // Decode JWT
  // --------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      setUserId(decoded.sub || "unknown-user");
    } catch {
      setUserId("invalid-token");
    }
  }, []);

  // --------------------------------------------------
  // Start execution session
  // --------------------------------------------------
  useEffect(() => {
    if (!projectId) return;

    const start = async () => {
      try {
        setSessionStarting(true);
        setSessionReady(false);

        await startSession(projectId);

        setSessionReady(true);
        setError(null);
      } catch (err: any) {
        setError(err?.message || "Failed to start execution session");
      } finally {
        setSessionStarting(false);
      }
    };

    start();
  }, [projectId]);

  // --------------------------------------------------
  // Code WebSocket (ONE TIME)
  // --------------------------------------------------
  useEffect(() => {
    if (!projectId || codeSocketConnected.current) return;

    codeSocketConnected.current = true;

    connectCodeSocket(projectId, (msg: CodeEditMessage) => {
      if (msg.userId === userId) return;
      if (msg.path === filePath) {
        onChange(msg.content);
      }
    });
  }, [projectId, userId, filePath, onChange]);

  // --------------------------------------------------
  // Run WebSocket (ONE TIME)
  // --------------------------------------------------
  useEffect(() => {
    if (!projectId || runSocketConnected.current) return;

    runSocketConnected.current = true;

    const buffer = { current: "" };

    connectRunSocket(projectId, (msg: RunCodeBroadcastMessage) => {
      if (runTimeoutRef.current) {
        clearTimeout(runTimeoutRef.current);
        runTimeoutRef.current = null;
      }

      if (msg.type === "RUN_STARTED") {
        buffer.current = "";
        onRunResult("(Running...)", null);
        return;
      }

      if (msg.type === "RUN_OUTPUT") {
        buffer.current += (msg.output ?? "") + "\n";
        onRunResult(buffer.current.trimEnd(), null);
        return;
      }

      if (msg.type === "RUN_FINISHED") {
        const finalOut =
          msg.output?.trimEnd() ||
          buffer.current.trimEnd() ||
          "(No output)";

        onRunResult(finalOut, msg.exitCode ?? null);

        if (msg.exitCode && msg.exitCode !== 0) {
          setError(`Process exited with code ${msg.exitCode}`);
        } else {
          setError(null);
        }
      }
    });
  }, [projectId, onRunResult]);

  // --------------------------------------------------
  // Run trigger
  // --------------------------------------------------
  useEffect(() => {
    if (!runSignal) return;
    if (!filePath) return;
    if (!sessionReady) return;

    setError(null);

    sendRunRequest(projectId!, {
      projectId,
      userId,
      filename: filePath,
      timeoutSeconds: 10,
    });

    runTimeoutRef.current = window.setTimeout(() => {
      setError(
        "No output received from execution engine. Try refreshing or disabling browser extensions."
      );
    }, 12000);
  }, [runSignal]);

  // --------------------------------------------------
  // Editor theme
  // --------------------------------------------------
  const handleEditorMount: OnMount = (editor, monaco) => {
    monaco.editor.defineTheme("codeastra-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A9955" },
        { token: "keyword", foreground: "C586C0" },
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
      ],
      colors: {
        "editor.background": "#000000",
      },
    });

    monaco.editor.setTheme("codeastra-dark");
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  if (!filePath) {
    return (
      <div className="flex h-full items-center justify-center text-white/40 text-sm">
        Select a file to start editing
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {error && (
        <div className="px-4 py-2 bg-red-900/70 text-red-200 text-xs">
          {error}
        </div>
      )}

      <div className="flex-1 p-4">
        <div className="flex flex-col h-full rounded-xl overflow-hidden border border-[#2a2b36] bg-[#1a1b26]">
          <div className="px-4 py-2 text-xs text-gray-400 border-b border-[#2a2b36]">
            Editing: {filePath}
          </div>

          <Editor
            height="100%"
            value={content}
            onChange={(v) => onChange(v || "")}
            theme="codeastra-dark"
            onMount={handleEditorMount}
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              automaticLayout: true,
              scrollBeyondLastLine: false,
            }}
          />
        </div>
      </div>
    </div>
  );
}
