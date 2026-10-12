import React from 'react';

export type NavItem = 
  | 'dashboard'
  | 'sql-playground'
  | 'artists-&-artworks'
  | 'jdbc-&-odbc-lab'
  | 'learn-dbms'
  | 'database-explorer'
  | 'settings';

interface SidebarProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  currentUser: {
    name: string;
    role: string;
    avatarInitials: string;
  };
  onSignOut: () => void;
  pingMs?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onSignOut,
  pingMs = 12
}) => {
  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-[#f4f3f1] border-r border-[#e9e8e5] shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between select-none">
      <div className="flex flex-col">
        {/* Brand Lockup */}
        <div className="p-3.5 flex flex-col gap-1 bg-[#f4f3f1]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#9e3825] flex items-center justify-center text-white shadow-[0_1px_8px_rgba(0,0,0,0.04)] shrink-0">
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-[#1a1c1a] tracking-tight leading-tight text-base truncate">
                ArtGallery
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#57423e] font-mono font-medium truncate">
                DBMS Workbench
              </span>
            </div>
          </div>

          <div className="mt-1 flex items-center justify-between px-2 py-1 rounded bg-white shadow-[0_1px_4px_rgba(0,0,0,0.03)] border border-[#e8e7e4]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2e6a4f] animate-pulse"></span>
              <span className="text-[10px] text-[#57423e] font-medium font-mono">Oracle 23ai</span>
            </div>
            <span className="text-[9px] text-[#2e6a4f] bg-[#eaf2ec] px-1.5 py-0.2 rounded font-mono font-semibold">
              Connected
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-0.5 px-2 py-2">
          <div className="px-2 pb-1 text-[#8c7873] text-[9px] uppercase font-mono tracking-wider font-semibold">
            Navigation
          </div>

          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-all duration-150 text-left text-xs ${
              currentTab === 'dashboard'
                ? 'bg-[#9e3825] text-white font-medium shadow-[0_1px_8px_rgba(0,0,0,0.06)]'
                : 'text-[#57423e] hover:bg-[#e9e8e5] hover:text-[#1a1c1a]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">grid_view</span>
            <span className="truncate">Dashboard</span>
          </button>

          <button
            onClick={() => onSelectTab('sql-playground')}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md transition-all duration-150 text-left text-xs ${
              currentTab === 'sql-playground'
                ? 'bg-[#9e3825] text-white font-medium shadow-[0_1px_8px_rgba(0,0,0,0.06)]'
                : 'text-[#57423e] hover:bg-[#e9e8e5] hover:text-[#1a1c1a]'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[18px]">terminal</span>
              <span className="truncate">SQL Playground</span>
            </div>
            <span
              className={`text-[9px] uppercase px-1 py-0.2 rounded font-mono font-bold shrink-0 ${
                currentTab === 'sql-playground'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#ffdad3] text-[#3e0400]'
              }`}
            >
              v2
            </span>
          </button>

          <button
            onClick={() => onSelectTab('artists-&-artworks')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-all duration-150 text-left text-xs ${
              currentTab === 'artists-&-artworks'
                ? 'bg-[#9e3825] text-white font-medium shadow-[0_1px_8px_rgba(0,0,0,0.06)]'
                : 'text-[#57423e] hover:bg-[#e9e8e5] hover:text-[#1a1c1a]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">palette</span>
            <span className="truncate">Artists &amp; Artworks</span>
          </button>

          <button
            onClick={() => onSelectTab('jdbc-&-odbc-lab')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-all duration-150 text-left text-xs ${
              currentTab === 'jdbc-&-odbc-lab'
                ? 'bg-[#9e3825] text-white font-medium shadow-[0_1px_8px_rgba(0,0,0,0.06)]'
                : 'text-[#57423e] hover:bg-[#e9e8e5] hover:text-[#1a1c1a]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">hub</span>
            <span className="truncate">JDBC &amp; ODBC Lab</span>
          </button>

          <button
            onClick={() => onSelectTab('learn-dbms')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-all duration-150 text-left text-xs ${
              currentTab === 'learn-dbms'
                ? 'bg-[#9e3825] text-white font-medium shadow-[0_1px_8px_rgba(0,0,0,0.06)]'
                : 'text-[#57423e] hover:bg-[#e9e8e5] hover:text-[#1a1c1a]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            <span className="truncate">Learn DBMS</span>
          </button>

          <button
            onClick={() => onSelectTab('database-explorer')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-all duration-150 text-left text-xs ${
              currentTab === 'database-explorer'
                ? 'bg-[#9e3825] text-white font-medium shadow-[0_1px_8px_rgba(0,0,0,0.06)]'
                : 'text-[#57423e] hover:bg-[#e9e8e5] hover:text-[#1a1c1a]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">account_tree</span>
            <span className="truncate">Database Explorer</span>
          </button>

          <div className="my-1.5 border-t border-[#e2e0dc]" />

          <div className="px-2 pb-1 text-[#8c7873] text-[9px] uppercase font-mono tracking-wider font-semibold">
            System
          </div>

          <button
            onClick={() => onSelectTab('settings')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-all duration-150 text-left text-xs ${
              currentTab === 'settings'
                ? 'bg-[#9e3825] text-white font-medium shadow-[0_1px_8px_rgba(0,0,0,0.06)]'
                : 'text-[#57423e] hover:bg-[#e9e8e5] hover:text-[#1a1c1a]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span className="truncate">Settings</span>
          </button>
        </nav>
      </div>

      {/* Bottom Profile and Ping Card */}
      <div className="p-2.5 m-2.5 rounded bg-white border border-[#e8e7e4] shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex flex-col gap-1.5">
        <div className="flex items-center justify-between pb-1 border-b border-[#f0eeea]">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#2e6a4f]">wifi_tethering</span>
            <span className="text-[11px] font-mono text-[#57423e]">Ping: {pingMs}ms</span>
          </div>
          <span className="text-[10px] font-mono text-[#57423e] uppercase font-semibold">
            TLS 1.3
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded bg-[#7e2110] text-white font-semibold flex items-center justify-center shrink-0 text-xs">
              {currentUser.avatarInitials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[#1a1c1a] truncate leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-[#57423e] truncate font-mono">
                {currentUser.role}
              </span>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="p-1 rounded text-[#57423e] hover:text-[#7e2110] hover:bg-[#f4f3f1] transition-colors flex items-center justify-center"
            title="Sign out / Switch account"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
