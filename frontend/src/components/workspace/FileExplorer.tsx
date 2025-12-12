import { useState } from "react";
import {
  X,
  FilePlus,
  FolderPlus,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  File as FileIcon,
  Folder as FolderIcon,
} from "lucide-react";

type FileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
};

type FileExplorerProps = {
  onClose: () => void;
  onCreateFile?: (name: string) => void;
  onCreateFolder?: (name: string) => void;
};

const initialTree: FileNode[] = [
  {
    id: "folder-src",
    name: "src",
    type: "folder",
    children: [
      { id: "file-main", name: "main.py", type: "file" },
      { id: "file-utils", name: "utils.py", type: "file" },
    ],
  },
  {
    id: "folder-config",
    name: "config",
    type: "folder",
    children: [{ id: "file-config", name: "settings.json", type: "file" }],
  },
];

export function FileExplorer({
  onClose,
  onCreateFile,
  onCreateFolder,
}: FileExplorerProps) {
  const [tree, setTree] = useState<FileNode[]>(initialTree);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "folder-src": true,
    "folder-config": true,
  });

  const toggleFolder = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const handleNewFile = () => {
    const name = window.prompt("New file name (e.g. app.py):");
    if (!name) return;

    // notify parent if needed
    if (onCreateFile) onCreateFile(name);

    // simple: add as root-level file in local UI
    setTree((prev) => [
      ...prev,
      { id: makeId(), name, type: "file" },
    ]);
  };

  const handleNewFolder = () => {
    const name = window.prompt("New folder name:");
    if (!name) return;

    if (onCreateFolder) onCreateFolder(name);

    setTree((prev) => [
      ...prev,
      { id: makeId(), name, type: "folder", children: [] },
    ]);
  };

  const renderNode = (node: FileNode, depth = 0) => {
    const paddingLeft = 8 + depth * 12;

    if (node.type === "folder") {
      const isOpen = expanded[node.id];

      return (
        <div key={node.id}>
          <button
            type="button"
            onClick={() => toggleFolder(node.id)}
            className="w-full flex items-center gap-1.5 text-xs text-white/80 hover:bg-white/5 px-2 py-1 rounded"
            style={{ paddingLeft }}
          >
            {isOpen ? (
              <ChevronDown className="w-3 h-3 text-white/60" />
            ) : (
              <ChevronRight className="w-3 h-3 text-white/60" />
            )}
            <FolderIcon className="w-3.5 h-3.5 text-[#fbbf24]" />
            <span>{node.name}</span>
          </button>

          {isOpen && node.children && node.children.length > 0 && (
            <div className="mt-0.5">
              {node.children.map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // file
    return (
      <button
        key={node.id}
        type="button"
        className="w-full flex items-center gap-1.5 text-xs text-white/70 hover:bg-white/5 px-2 py-1 rounded"
        style={{ paddingLeft }}
      >
        <FileIcon className="w-3.5 h-3.5 text-white/60" />
        <span>{node.name}</span>
      </button>
    );
  };

  return (
    <div className="w-64 bg-[#0f0f0f] border-r border-white/5 flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wide text-white/60">
            EXPLORER
          </span>
          {/* Optional: current project label */}
          {/* <span className="text-xs text-white/40">CodeAstra Project</span> */}
        </div>

        <div className="flex items-center gap-1">
          {/* New File */}
          <button
            type="button"
            onClick={handleNewFile}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-white/70"
            title="New File"
          >
            <FilePlus className="w-4 h-4" />
          </button>

          {/* New Folder */}
          <button
            type="button"
            onClick={handleNewFolder}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-white/70"
            title="New Folder"
          >
            <FolderPlus className="w-4 h-4" />
          </button>

          {/* More / Close */}
          <button
            type="button"
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-white/50"
            title="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-white/70"
            title="Close Explorer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body: file tree */}
      <div className="flex-1 overflow-auto py-2">
        {tree.map((node) => renderNode(node))}
      </div>
    </div>
  );
}
