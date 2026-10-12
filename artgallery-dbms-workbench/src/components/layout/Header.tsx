import React from 'react';

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onOpenHelp: () => void;
  onToggleNotifications: () => void;
  hasUnreadNotifications?: boolean;
  currentUser: {
    name: string;
    role: string;
  };
  onSwitchUser: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCommandPalette,
  onOpenHelp,
  onToggleNotifications,
  hasUnreadNotifications = true,
  currentUser,
  onSwitchUser
}) => {
  return (
    <header className="fixed top-0 left-60 right-0 h-16 bg-[#faf9f6]/95 backdrop-blur-md border-b border-[#e9e8e5] shadow-[0_1px_8px_rgba(0,0,0,0.02)] z-40 flex items-center justify-between px-8">
      {/* Left Workspace Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[#57423e] text-[11px] font-mono uppercase tracking-wider">
          <span className="font-semibold text-[#1a1c1a] font-sans">Archive Workspace</span>
          <span className="text-[#dec0ba]">/</span>
          <span className="font-mono text-[#633808] font-bold">FREEPDB1</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#e9e8e5] border border-[#dedcd7]">
          <span className="w-2 h-2 rounded-full bg-[#7e2110]"></span>
          <span className="text-[10px] font-mono text-[#1a1c1a] font-semibold">
            Prod-ReadWrite
          </span>
        </div>
      </div>

      {/* Right Search & Controls */}
      <div className="flex items-center gap-4">
        {/* Global Search Bar */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#57423e] pointer-events-none">
            search
          </span>
          <input
            onClick={onOpenCommandPalette}
            readOnly
            className="w-72 pl-9 pr-16 py-1.5 rounded bg-white text-[#1a1c1a] text-xs placeholder:text-[#57423e]/70 border border-[#e4e3df] shadow-[0_1px_4px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-1 focus:ring-[#9e3825] cursor-pointer transition-all"
            placeholder="Search entities, queries, procedures..."
            type="text"
          />
          <button
            onClick={onOpenCommandPalette}
            className="absolute right-2 text-[10px] font-mono text-[#57423e] bg-[#efeeeb] border border-[#e2e1dc] px-1.5 py-0.5 rounded select-none cursor-pointer hover:bg-[#e3e2e0]"
          >
            ⌘K
          </button>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenHelp}
            className="p-2 rounded text-[#57423e] hover:bg-[#e9e8e5] hover:text-[#1a1c1a] transition-colors"
            title="Database Documentation & DDL Spec"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">help_outline</span>
          </button>

          <button
            onClick={onToggleNotifications}
            className="relative p-2 rounded text-[#57423e] hover:bg-[#e9e8e5] hover:text-[#1a1c1a] transition-colors"
            title="System Alerts & Cursors"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {hasUnreadNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#7e2110]"></span>
            )}
          </button>

          <button
            onClick={onSwitchUser}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded hover:bg-[#e9e8e5] transition-colors group cursor-pointer"
            title="Switch User / Access Profile"
          >
            <div className="w-8 h-8 rounded-full bg-[#7e2110] text-white flex items-center justify-center shrink-0 text-xs font-semibold shadow-xs">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#1a1c1a] leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-[#57423e] font-mono">
                {currentUser.role}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
