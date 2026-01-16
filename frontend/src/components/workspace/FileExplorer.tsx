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
  name: string;
  path: string;
  type: "FILE" | "FOLDER";
  children?: FileNode[] | null;
};

type FileExplorerProps = {
  tree?: FileNode[];
  onSelect: (path: string) => void;
  onCreate: (path: string, type: "FILE" | "FOLDER") => void;
  onDelete: (path: string) => void;
  onClose: () => void;
};

export function FileExplorer({
  tree = [],
  onSelect,
  onCreate,
  onDelete,
  onClose,
}: FileExplorerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleFolder = (path: string) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleNewFile = () => {
    const name = prompt("New file name (example: src/main.py)");
    if (!name) return;
    onCreate(name, "FILE");
  };

  const handleNewFolder = () => {
    const name = prompt("New folder name (example: src/components)");
    if (!name) return;
    onCreate(name, "FOLDER");
  };

  const safeChildren = (node: FileNode): FileNode[] =>
    Array.isArray(node.children) ? node.children : [];

  const renderNode = (node: FileNode, depth = 0) => {
    const paddingLeft = 8 + depth * 12;

    if (node.type === "FOLDER") {
      const isOpen = expanded[node.path];

      return (
        <div key={node.path}>
          <div
            className="flex items-center gap-1.5 text-xs text-white/80 hover:bg-white/5 px-2 py-1 rounded cursor-pointer"
            style={{ paddingLeft }}
            onClick={() => toggleFolder(node.path)}
          >
            {isOpen ? (
              <ChevronDown className="w-3 h-3 text-white/60" />
            ) : (
              <ChevronRight className="w-3 h-3 text-white/60" />
            )}
            <FolderIcon className="w-3.5 h-3.5 text-[#fbbf24]" />
            <span className="truncate">{node.name}</span>
          </div>

          {isOpen &&
            safeChildren(node).map((child) =>
              renderNode(child, depth + 1)
            )}
        </div>
      );
    }

    return (
      <div
        key={node.path}
        className="flex items-center gap-1.5 text-xs text-white/70 hover:bg-white/5 px-2 py-1 rounded cursor-pointer"
        style={{ paddingLeft }}
        onClick={() => onSelect(node.path)}
      >
        <FileIcon className="w-3.5 h-3.5 text-white/60" />
        <span className="truncate">{node.name}</span>
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-[#0f0f0f] border-r border-white/5 flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-white/5">
        <span className="text-xs font-semibold tracking-wide text-white/60">
          EXPLORER
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={handleNewFile}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-white/70"
            title="New File"
          >
            <FilePlus className="w-4 h-4" />
          </button>

          <button
            onClick={handleNewFolder}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-white/70"
            title="New Folder"
          >
            <FolderPlus className="w-4 h-4" />
          </button>

          <button
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-white/50"
            title="More"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-white/70"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto py-2">
        {Array.isArray(tree) && tree.length === 0 ? (
          <div className="px-3 text-xs text-white/40">
            No files yet
          </div>
        ) : Array.isArray(tree) ? (
          tree.map((node) => renderNode(node))
        ) : (
          <div className="px-3 text-xs text-red-500">
            Invalid file tree structure
          </div>
        )}
      </div>
    </div>
  );
}
