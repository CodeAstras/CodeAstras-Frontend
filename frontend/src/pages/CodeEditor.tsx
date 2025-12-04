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
  sub: string;    // user id (subject)
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
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.warn("No access_token found in localStorage");
      setUserId("anonymous");
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      if (decoded?.sub) {
        setUserId(decoded.sub);
      } else {
        console.warn("JWT has no 'sub' field; using fallback userId");
        setUserId("unknown-user");
      }
    } catch (e) {
      console.error("Failed to decode JWT:", e);
      setUserId("invalid-token-user");
    }
  }, []);

  // 1) Connect to code sync WS
  useEffect(() => {
    if (!projectId) return;

    connectCodeSocket(projectId, (msg: CodeEditMessage) => {
      console.log("Incoming CodeEditMessage:", msg);
      if (msg.path === filename) {
        setCode(msg.content);
      }
    });
  }, [projectId]);

  // 2) Connect to run WS
  useEffect(() => {
    if (!projectId) return;

    connectRunSocket(projectId, (msg: RunCodeBroadcastMessage) => {
      console.log("Run output:", msg);
      setOutput(msg.output ?? "");
      setExitCode(msg.exitCode);

      if (msg.exitCode !== 0) {
        setError(`Process exited with code ${msg.exitCode}`);
      } else {
        setError(null);
      }
      setIsRunning(false);
    });
  }, [projectId]);

  // When user types in Monaco
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

    console.log("Sending CodeEditMessage:", message);
    sendCodeEdit(projectId, message);
  };

  // When user clicks "Run ▶"
  const handleRun = () => {
    if (!projectId) {
      setError("No projectId in URL");
      return;
    }

    setIsRunning(true);
    setOutput("");
    setExitCode(null);
    setError(null);

    console.log("Sending run request with userId:", userId);

    sendRunRequest(projectId, {
      projectId,
      userId,
      filename,
      timeoutSeconds: 10,
    });
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
