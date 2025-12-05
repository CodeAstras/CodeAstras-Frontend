import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import {
  connectCodeSocket,
  sendCodeEdit,
  CodeEditMessage,
} from "../services/wsCode";
import {
  connectRunSocket,
  sendRunRequest,
  RunCodeBroadcastMessage,
} from "../services/wsRun";

interface JwtPayload {
  sub: string; // user id (subject)
  email?: string;
  name?: string;
}

export default function CodeEditor() {
  const { projectId } = useParams(); // also used as roomId

  const [code, setCode] = useState("# Start coding in CodeAstras 🚀\n");
  const [output, setOutput] = useState("");
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userId, setUserId] = useState<string>("unknown-user");

  const filename = "main.py";

  // 0) Decode JWT to get real userId
  useEffect(() => {
    console.log("[CodeEditor] mount/useEffect(jwt) ➜ starting JWT decode");

    const token = localStorage.getItem("access_token");
    console.log("[CodeEditor] access_token from localStorage:", token);

    if (!token) {
      console.warn("[CodeEditor] No access_token found, using 'anonymous'");
      setUserId("anonymous");
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      console.log("[CodeEditor] decoded JWT payload:", decoded);

      if (decoded?.sub) {
        setUserId(decoded.sub);
      } else {
        console.warn("[CodeEditor] JWT has no 'sub' field; using fallback userId");
        setUserId("unknown-user");
      }
    } catch (e) {
      console.error("[CodeEditor] Failed to decode JWT:", e);
      setUserId("invalid-token-user");
      setError("Failed to decode JWT. Please log in again.");
    }
  }, []);

  // 1) Connect to code sync WS
  useEffect(() => {
    if (!projectId) {
      console.warn("[CodeEditor] No projectId in URL; skipping code socket connect");
      return;
    }

    console.log("[CodeEditor] Connecting code WebSocket for projectId:", projectId);

    try {
      // just call it; don't expect a return value
      connectCodeSocket(projectId, (msg: CodeEditMessage) => {
        console.log("[CodeEditor] Incoming CodeEditMessage:", msg);
        if (msg.path === filename) {
          setCode(msg.content);
        } else {
          console.log(
            "[CodeEditor] Message for different path, ignoring. expected=",
            filename,
            "got=",
            msg.path
          );
        }
      });

      // If you later add an explicit disconnect function, call it here.
      return () => {
        console.log(
          "[CodeEditor] Cleanup for code WebSocket (no explicit disconnect function yet)"
        );
      };
    } catch (e) {
      console.error("[CodeEditor] Error connecting code WebSocket:", e);
      setError("Failed to connect to code sync WebSocket");
    }
  }, [projectId]);

  // 2) Connect to run WS
  useEffect(() => {
    if (!projectId) {
      console.warn("[CodeEditor] No projectId in URL; skipping run socket connect");
      return;
    }

    console.log("[CodeEditor] Connecting run WebSocket for projectId:", projectId);

    try {
      connectRunSocket(projectId, (msg: RunCodeBroadcastMessage) => {
        console.log("[CodeEditor] Run output message:", msg);
        setOutput(msg.output ?? "");
        setExitCode(msg.exitCode);

        if (msg.exitCode !== 0) {
          setError(`Process exited with code ${msg.exitCode}`);
        } else {
          setError(null);
        }
        setIsRunning(false);
      });

      return () => {
        console.log(
          "[CodeEditor] Cleanup for run WebSocket (no explicit disconnect function yet)"
        );
      };
    } catch (e) {
      console.error("[CodeEditor] Error connecting run WebSocket:", e);
      setError("Failed to connect to run WebSocket");
    }
  }, [projectId]);

  // When user types in Monaco
  const handleChange = (value: string | undefined) => {
    const updated = value || "";
    setCode(updated);

    console.log("[CodeEditor] handleChange() called. New length:", updated.length);

    if (!projectId) {
      console.warn("[CodeEditor] No projectId; not sending CodeEditMessage");
      return;
    }

    const message: CodeEditMessage = {
      projectId,
      userId,
      path: filename,
      content: updated,
    };

    console.log("[CodeEditor] Sending CodeEditMessage:", message);
    try {
      sendCodeEdit(projectId, message);
    } catch (e) {
      console.error("[CodeEditor] Error sending CodeEditMessage:", e);
      setError("Failed to send code edit over WebSocket");
    }
  };

  // When user clicks "Run ▶"
  const handleRun = () => {
    console.log("[CodeEditor] handleRun() clicked. projectId:", projectId, "userId:", userId);

    if (!projectId) {
      const msg = "No projectId in URL – cannot run code.";
      console.error("[CodeEditor]", msg);
      setError(msg);
      return;
    }

    setIsRunning(true);
    setOutput("");
    setExitCode(null);
    setError(null);

    const payload = {
      projectId,
      userId,
      filename,
      timeoutSeconds: 10,
    };

    console.log("[CodeEditor] Sending run request payload:", payload);

    try {
      sendRunRequest(projectId, payload);
    } catch (e) {
      console.error("[CodeEditor] Error sending run request:", e);
      setIsRunning(false);
      setError("Failed to send run request over WebSocket");
    }
  };

  return (
    <div className="w-full h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <div className="font-semibold text-sm">
          Project / Room: {projectId ?? "no-project-id"}{" "}
          <span className="ml-4 text-xs text-gray-400">
            User: {userId}
          </span>
        </div>
        <button
          onClick={handleRun}
          disabled={isRunning || !projectId}
          className="px-4 py-1 rounded bg-emerald-600 disabled:bg-gray-600 text-sm"
        >
          {isRunning ? "Running..." : "Run ▶"}
        </button>
      </div>

      {/* Show current error (debug helper) */}
      {error && (
        <div className="px-4 py-2 text-xs bg-red-900/60 text-red-200 border-b border-red-600">
          <strong>[Debug]</strong> {error}
        </div>
      )}

      {/* Editor + Output */}
      <div className="flex flex-1">
        {/* Left: Editor */}
        <div className="w-2/3 border-r border-gray-800">
          <Editor
            height="100%"
            width="100%"
            defaultLanguage="python"
            value={code}
            theme="vs-dark"
            onChange={handleChange}
            options={{
              automaticLayout: true,
              fontSize: 15,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        {/* Right: Output */}
        <div className="w-1/3 p-3 text-sm bg-black">
          <div className="font-semibold mb-2">Output</div>
          <pre className="whitespace-pre-wrap text-green-400">
            {output ||
              (isRunning ? "Running..." : "No output yet. Click Run ▶")}
          </pre>

          {exitCode !== null && (
            <div className="mt-2 text-xs text-gray-400">
              Exit code: {exitCode}
            </div>
          )}

          {error && (
            <div className="mt-2 text-red-400">
              Error: {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
