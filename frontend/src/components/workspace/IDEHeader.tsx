type IDEHeaderProps = {
  visible: boolean;
  projectName: string;
};

export function IDEHeader({ visible, projectName }: IDEHeaderProps) {
  if (!visible) return null;

  return (
    <header className="...">
      {/* Wherever you had "CodeAstra", do: */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#0ea5e9] animate-pulse" />
        <span className="bg-gradient-to-r from-[#7c3aed] to-[#0ea5e9] bg-clip-text text-transparent">
          {projectName}
        </span>
      </div>
      {/* ...rest of header */}
    </header>
  );
}
