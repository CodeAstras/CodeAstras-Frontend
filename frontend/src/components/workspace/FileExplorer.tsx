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
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const toggleFolder = (path: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleFolderClick = (path: string) => {
    // If clicking the same folder, just toggle selection (deselect)
    // or keep it selected? Let's keep it selected.
    // If different, select it.
    if (selectedFolder === path) {
      setSelectedFolder(null); // click again to deselect
    } else {
      setSelectedFolder(path);
    }
  };

  const handleNewFile = () => {
    const parentPath = selectedFolder ? `${selectedFolder}/` : "";
    const name = prompt(
      `New file name (creating in: ${selectedFolder || "root"})`
    );
    if (!name) return;

    // Auto-prepend parent path if user didn't type it
    const finalPath = name.startsWith(parentPath) ? name : `${parentPath}${name}`;
    onCreate(finalPath, "FILE");
  };

  const handleNewFolder = () => {
    const parentPath = selectedFolder ? `${selectedFolder}/` : "";
    const name = prompt(
      `New folder name (creating in: ${selectedFolder || "root"})`
    );
    if (!name) return;

    const finalPath = name.startsWith(parentPath) ? name : `${parentPath}${name}`;
    onCreate(finalPath, "FOLDER");
  };

  const safeChildren = (node: FileNode): FileNode[] =>
    Array.isArray(node.children) ? node.children : [];

  const renderNode = (node: FileNode, depth = 0) => {
    const paddingLeft = 8 + depth * 12;

    if (node.type === "FOLDER") {
      const isOpen = expanded[node.path];
      const isSelected = selectedFolder === node.path;

      return (
        <div key={node.path}>
          <div
            className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded cursor-pointer transition-colors ${isSelected
                ? "bg-blue-600/20 text-blue-200"
                : "text-white/80 hover:bg-white/5"
              }`}
            style={{ paddingLeft }}
            onClick={() => handleFolderClick(node.path)}
          >
            <div
              onClick={(e) => toggleFolder(node.path, e)}
              className="p-0.5 hover:bg-white/10 rounded"
            >
              {isOpen ? (
                <ChevronDown className="w-3 h-3 text-white/60" />
              ) : (
                <ChevronRight className="w-3 h-3 text-white/60" />
              )}
            </div>
            <FolderIcon className={`w-3.5 h-3.5 ${isSelected ? "text-blue-400" : "text-[#fbbf24]"}`} />
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
        <span className="w-3 inline-block" /> {/* Spacer for alignment since no chevron */}
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
            title={selectedFolder ? `New File in ${selectedFolder}` : "New File"}
          >
            <FilePlus className="w-4 h-4" />
          </button>

          <button
            onClick={handleNewFolder}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-white/70"
            title={selectedFolder ? `New Folder in ${selectedFolder}` : "New Folder"}
          >
            <FolderPlus className="w-4 h-4" />
          </button>

          <button
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-white/50"
            title="Collapse All"
            onClick={() => {
              setExpanded({});
              setSelectedFolder(null);
            }}
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
