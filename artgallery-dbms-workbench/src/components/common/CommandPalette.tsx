import React, { useState, useEffect } from 'react';
import { NavItem } from '../layout/Sidebar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavItem) => void;
  onSelectQuery?: (sql: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectQuery
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'sql',
      category: 'Worksheet',
      title: 'New SQL Worksheet',
      desc: 'Open scratchpad query editor',
      icon: 'terminal',
      run: () => {
        onNavigate('sql-playground');
        onClose();
      }
    },
    {
      id: 'artists',
      category: 'Registry',
      title: 'Search Artists Directory',
      desc: 'Browse master profiles & PK hashes',
      icon: 'groups',
      run: () => {
        onNavigate('artists-&-artworks');
        onClose();
      }
    },
    {
      id: 'jdbc',
      category: 'Driver Lab',
      title: 'Test JDBC / ODBC Protocols',
      desc: 'Execute Type-4 thin driver queries and transactions',
      icon: 'hub',
      run: () => {
        onNavigate('jdbc-&-odbc-lab');
        onClose();
      }
    },
    {
      id: 'er-modeler',
      category: 'Database Explorer',
      title: 'Launch ER Diagram Modeler',
      desc: 'Visual schema relationships and foreign keys',
      icon: 'schema',
      run: () => {
        onNavigate('database-explorer');
        onClose();
      }
    },
    {
      id: 'query-1',
      category: 'Recent Cursors',
      title: 'Query: High Value Artworks Join',
      desc: 'SELECT a.name, count(*), avg(price) FROM artists...',
      icon: 'database',
      run: () => {
        if (onSelectQuery) {
          onSelectQuery(`SELECT a.name, COUNT(w.id), AVG(w.price) FROM artists a JOIN artworks w ON a.id = w.artist_id GROUP BY a.name;`);
        }
        onNavigate('sql-playground');
        onClose();
      }
    },
    {
      id: 'theory',
      category: 'Curriculum',
      title: 'Learn DBMS Relational Theory',
      desc: 'Normalization, ACID, Indexes, and Codd’s 12 rules',
      icon: 'menu_book',
      run: () => {
        onNavigate('learn-dbms');
        onClose();
      }
    }
  ];

  const filteredActions = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-xs">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-[#e5e4e0] overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 border-b border-[#e9e8e5] bg-[#faf9f6]">
          <span className="material-symbols-outlined text-[20px] text-[#57423e] mr-2">
            search
          </span>
          <input
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type a command, query, or schema table..."
            className="w-full py-3 bg-transparent text-sm text-[#1a1c1a] placeholder:text-[#57423e]/60 focus:outline-none font-mono"
          />
          <button
            onClick={onClose}
            className="text-[10px] font-mono px-2 py-1 rounded bg-[#efeeeb] text-[#57423e]"
          >
            ESC
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-1">
          {filteredActions.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#57423e] font-mono">
              No matching commands or entities found for "{searchTerm}"
            </div>
          ) : (
            filteredActions.map((action) => (
              <button
                key={action.id}
                onClick={action.run}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#f4f3f1] text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#efeeeb] group-hover:bg-[#ffdad3] group-hover:text-[#7e2110] flex items-center justify-center text-[#57423e] transition-colors">
                    <span className="material-symbols-outlined text-[18px]">
                      {action.icon}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#1a1c1a]">
                      {action.title}
                    </span>
                    <span className="text-[11px] text-[#57423e] truncate max-w-xs sm:max-w-md">
                      {action.desc}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#efeeeb] text-[#57423e]">
                  {action.category}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t border-[#f0eeea] bg-[#f9f8f5] flex items-center justify-between text-[11px] font-mono text-[#8a716c]">
          <span>Navigation Quick Command</span>
          <span>ENTER to select • ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
