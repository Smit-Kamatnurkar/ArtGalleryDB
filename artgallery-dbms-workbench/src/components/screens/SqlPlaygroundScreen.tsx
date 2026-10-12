import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface SqlPlaygroundScreenProps {
  initialQuery?: string;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onExecuted?: () => void | Promise<void>;
}

const TEMPLATES = {
  join_high_value: `SELECT
  w.code,
  w.title,
  a.name AS artist_name,
  w.medium,
  w.price,
  w.status
FROM artworks w
INNER JOIN artists a ON w.artist_id = a.id
WHERE w.price >= 350000.00
  AND w.status = 'Exhibited'
ORDER BY w.price DESC;`,

  aggregate_country: `SELECT
  a.country,
  COUNT(w.id) AS total_works,
  ROUND(AVG(w.price), 2) AS average_valuation
FROM artists a
LEFT JOIN artworks w ON a.id = w.artist_id
GROUP BY a.country
HAVING COUNT(w.id) > 0
ORDER BY total_works DESC;`,

  provenance_audit: `SELECT
  w.code,
  w.title,
  w.year_created,
  w.price,
  w.status
FROM artworks w
WHERE w.status = 'Acquired'
  AND w.year_created < 1950;`,

  index_scan_demo: `SELECT
  w.code,
  w.title,
  a.name AS artist_name,
  w.price,
  w.status
FROM artworks w
JOIN artists a ON w.artist_id = a.id
WHERE w.price > 200000
ORDER BY w.price DESC;`
};

export const SqlPlaygroundScreen: React.FC<SqlPlaygroundScreenProps> = ({
  initialQuery,
  onShowToast,
  onExecuted
}) => {
  const [query, setQuery] = useState(initialQuery || TEMPLATES.join_high_value);
  const [selectedTemplate, setSelectedTemplate] = useState('join_high_value');
  const [showExplainPlan, setShowExplainPlan] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(24);
  const [columns, setColumns] = useState<string[]>([
    'code', 'title', 'artist_name', 'medium', 'price', 'status'
  ]);
  const [queryRows, setQueryRows] = useState<Record<string, unknown>[]>([
    { code: 'ART-2023-112', title: 'Composition with Yellow, Blue and Ochre', artist_name: 'Piet Mondrian', medium: 'Oil on linen', price: 1450000, status: 'Exhibited' },
    { code: 'ART-2023-044', title: 'Nighthawks Study #3', artist_name: 'Edward Hopper', medium: 'Oil on canvas', price: 875000, status: 'Exhibited' },
    { code: 'ART-2024-001', title: 'Study for Broad Canvas VI', artist_name: 'Helen Frankenthaler', medium: 'Acrylic on unprimed canvas', price: 620000, status: 'Exhibited' },
    { code: 'ART-2022-078', title: 'Geometric Monolith 12', artist_name: 'Eduardo Chillida', medium: 'Forged iron and granite', price: 410000, status: 'Exhibited' }
  ]);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [schemaSearch, setSchemaSearch] = useState('');
  const [isArtistOpen, setIsArtistOpen] = useState(true);
  const [isArtworkOpen, setIsArtworkOpen] = useState(true);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunQuery();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [query]);

  const handleTemplateChange = (key: string) => {
    setSelectedTemplate(key);
    if (key in TEMPLATES) {
      setQuery(TEMPLATES[key as keyof typeof TEMPLATES]);
      onShowToast(`Loaded SQL preset: ${key}`, 'info');
    }
  };

  const handleInsertToken = (token: string) => {
    setQuery((prev) => prev + `\n  ${token}`);
    onShowToast(`Appended token "${token}" to query buffer`, 'info');
  };

  const handleFormat = () => {
    // Simple indentation beautifier simulation
    const lines = query.split('\n').map((line) => line.trim());
    const formatted = lines
      .map((l) => {
        if (/^(SELECT|FROM|WHERE|INNER JOIN|LEFT JOIN|JOIN|GROUP BY|HAVING|ORDER BY|EXPLAIN)/i.test(l)) {
          return l;
        }
        return '  ' + l;
      })
      .join('\n');
    setQuery(formatted);
    onShowToast('SQL statement formatted with canonical 2-space indentation', 'success');
  };

  const handleRunQuery = async () => {
    if (!query.trim()) {
      onShowToast('Please enter a SQL query to execute', 'error');
      return;
    }
    setIsRunning(true);
    setQueryError(null);
    try {
      const result = await api.executeSql(query.trim());
      setExecutionTime(result.executionTimeMs);
      if (result.columns && result.columns.length > 0) {
        setColumns(result.columns);
      }
      setQueryRows(result.rows || []);
      onShowToast(`Statement executed successfully (${result.executionTimeMs}ms, ${result.rowCount} rows fetched)`, 'success');
      if (onExecuted) {
        await onExecuted();
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'SQL Execution failed';
      setQueryError(errMsg);
      onShowToast(errMsg, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(queryRows, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      onShowToast(`Copied ${queryRows.length} records as JSON to clipboard`, 'success');
    });
  };

  const handleExportCsv = () => {
    if (columns.length === 0 || queryRows.length === 0) {
      onShowToast('No rows to export', 'info');
      return;
    }
    const header = columns.join(',') + '\n';
    const body = queryRows
      .map((r) =>
        columns
          .map((col) => {
            const val = r[col];
            if (val === null || val === undefined) return '';
            const str = String(val);
            return str.includes(',') || str.includes('"') || str.includes('\n')
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(',')
      )
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'artgallery_query_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onShowToast('Exported CSV dataset successfully', 'success');
  };

  const lineCount = Math.max(7, query.split('\n').length);

  return (
    <div className="flex flex-col w-full gap-4">
      {/* Top Context & Metric Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 bg-[#faf9f6]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#1a1c1a] tracking-tight">
              Interactive SQL Console
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#e9e8e5] text-[#57423e] text-[10px] font-mono uppercase font-semibold">
              FREEPDB1.SCHEMA_CURATOR
            </span>
          </div>
          <p className="text-sm text-[#57423e] max-w-2xl">
            Execute declarative relational queries against the curatorial catalogue. Inspect joins, cost execution plans, and row-level catalog assertions.
          </p>
        </div>

        {/* Live Node Cluster Stats */}
        <div className="flex items-center gap-3 mt-2 md:mt-0">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#e8e7e4] shadow-xs">
            <div className="w-2 h-2 rounded-full bg-[#2e6a4f] animate-pulse"></div>
            <span className="text-xs font-mono text-[#57423e]">
              SGA Cache: <span className="text-[#1a1c1a] font-semibold">94.8% Hit</span>
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#e8e7e4] shadow-xs">
            <span className="material-symbols-outlined text-[16px] text-[#633808]">
              database
            </span>
            <span className="text-xs font-mono text-[#57423e]">
              Active Session: <span className="text-[#1a1c1a] font-semibold">SID#412</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main 12-Column Layout */}
      <div className="grid grid-cols-12 gap-4 w-full items-start">
        {/* LEFT PANEL: Schema Navigator & Token Injector (Col 1-3) */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col gap-3 bg-white rounded-lg border border-[#e8e7e4] shadow-xs p-4 select-none">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#9e3825]">
                schema
              </span>
              <span className="text-base font-bold text-[#1a1c1a] tracking-tight">
                Schema Tree
              </span>
            </div>
            <span className="text-[10px] uppercase text-[#57423e] bg-[#efeeeb] px-1.5 py-0.5 rounded font-mono font-semibold border border-[#e2e1dc]">
              2 Tables
            </span>
          </div>

          <p className="text-xs text-[#57423e] leading-relaxed">
            Click identifiers or tokens below to insert directly at the cursor line.
          </p>

          {/* Search Filter */}
          <div className="relative my-1">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-[#57423e] pointer-events-none">
              filter_list
            </span>
            <input
              value={schemaSearch}
              onChange={(e) => setSchemaSearch(e.target.value)}
              placeholder="Filter columns or tables..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#f4f3f1] border border-[#e6e5e1] text-[#1a1c1a] text-xs font-mono rounded focus:outline-none focus:bg-white focus:border-[#9e3825] transition-colors"
            />
          </div>

          {/* Collapsible Object Tree */}
          <div className="flex flex-col gap-2 mt-1 text-xs font-mono">
            {/* Table 1: ARTIST */}
            <div className="flex flex-col rounded bg-[#f4f3f1]/70 border border-[#e8e7e4] overflow-hidden">
              <button
                type="button"
                onClick={() => setIsArtistOpen(!isArtistOpen)}
                className="flex items-center justify-between w-full px-2.5 py-2 hover:bg-[#e9e8e5] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`material-symbols-outlined text-[16px] text-[#57423e] transition-transform duration-150 ${
                      isArtistOpen ? 'rotate-90' : ''
                    }`}
                  >
                    chevron_right
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-[#633808]">
                    table_chart
                  </span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInsertToken('ARTIST');
                    }}
                    className="font-semibold text-[#1a1c1a] hover:text-[#7e2110] transition-colors"
                  >
                    ARTIST
                  </span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#e3e2e0] text-[#57423e]">
                  3 cols
                </span>
              </button>

              {isArtistOpen && (
                <div className="flex flex-col py-1 pl-6 pr-2 gap-1 bg-white border-t border-[#e8e7e4]">
                  <div
                    onClick={() => handleInsertToken('a.ArtistID')}
                    className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#f4f3f1] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="material-symbols-outlined text-[13px] text-[#7e2110]" title="Primary Key">
                        key
                      </span>
                      <span className="text-[#1a1c1a] font-medium truncate group-hover:text-[#7e2110]">
                        ArtistID
                      </span>
                    </div>
                    <span className="text-[9px] text-[#57423e] bg-[#efeeeb] px-1 py-0.5 rounded font-mono font-semibold">
                      INT • PK
                    </span>
                  </div>

                  <div
                    onClick={() => handleInsertToken('a.ArtistName')}
                    className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#f4f3f1] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="material-symbols-outlined text-[13px] text-[#57423e]">
                        title
                      </span>
                      <span className="text-[#1a1c1a] truncate group-hover:text-[#7e2110]">
                        ArtistName
                      </span>
                    </div>
                    <span className="text-[9px] text-[#57423e] bg-[#efeeeb] px-1 py-0.5 rounded font-mono">
                      VARCHAR
                    </span>
                  </div>

                  <div
                    onClick={() => handleInsertToken('a.Country')}
                    className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#f4f3f1] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="material-symbols-outlined text-[13px] text-[#57423e]">
                        public
                      </span>
                      <span className="text-[#1a1c1a] truncate group-hover:text-[#7e2110]">
                        Country
                      </span>
                    </div>
                    <span className="text-[9px] text-[#57423e] bg-[#efeeeb] px-1 py-0.5 rounded font-mono">
                      CHAR(3)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Table 2: ARTWORK */}
            <div className="flex flex-col rounded bg-[#f4f3f1]/70 border border-[#e8e7e4] overflow-hidden">
              <button
                type="button"
                onClick={() => setIsArtworkOpen(!isArtworkOpen)}
                className="flex items-center justify-between w-full px-2.5 py-2 hover:bg-[#e9e8e5] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`material-symbols-outlined text-[16px] text-[#57423e] transition-transform duration-150 ${
                      isArtworkOpen ? 'rotate-90' : ''
                    }`}
                  >
                    chevron_right
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-[#633808]">
                    table_chart
                  </span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInsertToken('ARTWORK');
                    }}
                    className="font-semibold text-[#1a1c1a] hover:text-[#7e2110] transition-colors"
                  >
                    ARTWORK
                  </span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#e3e2e0] text-[#57423e]">
                  7 cols
                </span>
              </button>

              {isArtworkOpen && (
                <div className="flex flex-col py-1 pl-6 pr-2 gap-1 bg-white border-t border-[#e8e7e4]">
                  <div
                    onClick={() => handleInsertToken('w.ArtworkID')}
                    className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#f4f3f1] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="material-symbols-outlined text-[13px] text-[#7e2110]">
                        key
                      </span>
                      <span className="text-[#1a1c1a] font-medium truncate group-hover:text-[#7e2110]">
                        ArtworkID
                      </span>
                    </div>
                    <span className="text-[9px] text-[#57423e] bg-[#efeeeb] px-1 py-0.5 rounded font-mono font-semibold">
                      INT • PK
                    </span>
                  </div>

                  <div
                    onClick={() => handleInsertToken('w.Title')}
                    className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#f4f3f1] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="material-symbols-outlined text-[13px] text-[#57423e]">
                        format_paint
                      </span>
                      <span className="text-[#1a1c1a] truncate group-hover:text-[#7e2110]">
                        Title
                      </span>
                    </div>
                    <span className="text-[9px] text-[#57423e] bg-[#efeeeb] px-1 py-0.5 rounded font-mono">
                      VARCHAR
                    </span>
                  </div>

                  <div
                    onClick={() => handleInsertToken('w.ArtistID')}
                    className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#f4f3f1] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="material-symbols-outlined text-[13px] text-[#2e6a4f]">
                        link
                      </span>
                      <span className="text-[#1a1c1a] truncate group-hover:text-[#7e2110]">
                        ArtistID
                      </span>
                    </div>
                    <span className="text-[9px] text-[#57423e] bg-[#efeeeb] px-1 py-0.5 rounded font-mono">
                      INT • FK
                    </span>
                  </div>

                  <div
                    onClick={() => handleInsertToken('w.Medium')}
                    className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#f4f3f1] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="material-symbols-outlined text-[13px] text-[#57423e]">
                        palette
                      </span>
                      <span className="text-[#1a1c1a] truncate group-hover:text-[#7e2110]">
                        Medium
                      </span>
                    </div>
                    <span className="text-[9px] text-[#57423e] bg-[#efeeeb] px-1 py-0.5 rounded font-mono">
                      VARCHAR
                    </span>
                  </div>

                  <div
                    onClick={() => handleInsertToken('w.Price')}
                    className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#f4f3f1] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="material-symbols-outlined text-[13px] text-[#633808]">
                        payments
                      </span>
                      <span className="text-[#1a1c1a] truncate group-hover:text-[#7e2110]">
                        Price
                      </span>
                    </div>
                    <span className="text-[9px] text-[#57423e] bg-[#efeeeb] px-1 py-0.5 rounded font-mono">
                      DECIMAL
                    </span>
                  </div>

                  <div
                    onClick={() => handleInsertToken('w.Status')}
                    className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#f4f3f1] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="material-symbols-outlined text-[13px] text-[#57423e]">
                        inventory_2
                      </span>
                      <span className="text-[#1a1c1a] truncate group-hover:text-[#7e2110]">
                        Status
                      </span>
                    </div>
                    <span className="text-[9px] text-[#57423e] bg-[#efeeeb] px-1 py-0.5 rounded font-mono">
                      ENUM
                    </span>
                  </div>

                  <div
                    onClick={() => handleInsertToken('w.YearCreated')}
                    className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#f4f3f1] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="material-symbols-outlined text-[13px] text-[#57423e]">
                        calendar_month
                      </span>
                      <span className="text-[#1a1c1a] truncate group-hover:text-[#7e2110]">
                        YearCreated
                      </span>
                    </div>
                    <span className="text-[9px] text-[#57423e] bg-[#efeeeb] px-1 py-0.5 rounded font-mono">
                      NUMBER(4)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Syntax Injection Snippets */}
          <div className="mt-2 p-2.5 bg-[#f4f3f1] rounded-lg border border-[#e8e7e4] flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#57423e] font-semibold">
              Quick Injection Snippets
            </span>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => handleInsertToken('INNER JOIN ARTIST a ON w.ArtistID = a.ArtistID')}
                className="px-2 py-1 bg-white hover:bg-[#e9e8e5] border border-[#dfdeda] rounded text-[#1a1c1a] text-[11px] font-mono transition-colors text-left shadow-2xs cursor-pointer"
              >
                JOIN Artist
              </button>
              <button
                type="button"
                onClick={() => handleInsertToken('WHERE w.Price >= 500000')}
                className="px-2 py-1 bg-white hover:bg-[#e9e8e5] border border-[#dfdeda] rounded text-[#1a1c1a] text-[11px] font-mono transition-colors text-left shadow-2xs cursor-pointer"
              >
                Price &gt;= 500k
              </button>
              <button
                type="button"
                onClick={() => handleInsertToken('GROUP BY a.ArtistName HAVING count(*) > 1')}
                className="px-2 py-1 bg-white hover:bg-[#e9e8e5] border border-[#dfdeda] rounded text-[#1a1c1a] text-[11px] font-mono transition-colors text-left shadow-2xs cursor-pointer"
              >
                Group &amp; Having
              </button>
            </div>
          </div>

          {/* Curatorial Archival Preview Micro-card */}
          <div className="mt-1 p-2 bg-[#efeeeb] rounded-lg border border-[#e2e1dc] flex items-center gap-2.5">
            <div className="w-12 h-12 rounded bg-[#e3e2e0] shrink-0 overflow-hidden relative border border-[#dbdad7]">
              <img
                className="w-full h-full object-cover"
                alt="Archive Batch"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmvRJz8Wj2NPmoYocXjhbK-2is4H0h0srv-v8WBzx6UCNymfvN5umqsBNDxbzXGurL9iKflFA2Qef1v72LpRzP7pUxRYPi1dTzn-YSAb1WtUxHSpIuIAT0hHPfRYQ9Mmpk44NoKoQR0Zei1ZiaJA7viRfsTe0_Ld6jEes-Lh35um7D5Tuilk6e-poo1uQJw5jgXENJuHrf73HLQy2u9FdupkMF7-jDsX7sanC7iElr4DV3c3zcn_Gv"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[#1a1c1a] truncate">
                Archive Batch #892
              </span>
              <span className="text-[10px] text-[#57423e] truncate font-mono">
                Relational integrity verified
              </span>
            </div>
          </div>
        </aside>

        {/* CENTER & RIGHT: Central IDE Workspace + Telemetry/Data Grid (Col 4-12) */}
        <section className="col-span-12 lg:col-span-9 flex flex-col gap-4">
          {/* Workstation Header & Execution Control Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-2.5 rounded-lg border border-[#e8e7e4] shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Target DB Pill */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f4f3f1] border border-[#e6e5e1] text-xs font-mono text-[#1a1c1a]">
                <span className="w-2 h-2 rounded-full bg-[#2e6a4f]"></span>
                <span className="font-semibold">Oracle FREEPDB1</span>
              </div>

              {/* Dialect Badge */}
              <span className="px-2 py-1 rounded bg-[#e9e8e5] text-[10px] font-mono text-[#633808] uppercase font-bold border border-[#dedcd7]">
                PL/SQL 23ai
              </span>

              {/* Preset Templates Selector */}
              <div className="relative">
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="appearance-none bg-[#f4f3f1] hover:bg-[#e9e8e5] border border-[#e6e5e1] text-[#1a1c1a] text-xs font-mono pl-2.5 pr-7 py-1 rounded cursor-pointer focus:outline-none focus:border-[#9e3825] transition-colors"
                >
                  <option value="join_high_value">Template: Join Artists &amp; High-Value Artworks</option>
                  <option value="aggregate_country">Template: Volume &amp; Valuation per Country</option>
                  <option value="provenance_audit">Template: Uncatalogued Acquired Pieces</option>
                  <option value="index_scan_demo">Template: Full Table Scan vs B-Tree Index</option>
                </select>
                <span className="material-symbols-outlined absolute right-1.5 top-1.5 text-[16px] text-[#57423e] pointer-events-none">
                  arrow_drop_down
                </span>
              </div>
            </div>

            {/* Action Command Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFormat}
                className="h-9 px-3.5 rounded-lg bg-[#f4f3f1] hover:bg-[#e9e8e5] border border-[#e4e3df] text-[#1a1c1a] text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:translate-y-px"
                title="Format SQL indentation"
              >
                <span className="material-symbols-outlined text-[16px]">align_horizontal_left</span>
                <span>Format</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowExplainPlan(!showExplainPlan);
                  onShowToast(showExplainPlan ? 'Closed Explain Plan drawer' : 'Opened Optimizer Cost Execution Plan', 'info');
                }}
                className={`h-9 px-3.5 rounded-lg border text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:translate-y-px ${
                  showExplainPlan
                    ? 'bg-[#efeeeb] text-[#7e2110] border-[#7e2110]/40 font-semibold'
                    : 'bg-[#f4f3f1] hover:bg-[#e9e8e5] border-[#e4e3df] text-[#1a1c1a]'
                }`}
                title="View query cost execution plan"
              >
                <span className="material-symbols-outlined text-[16px]">analytics</span>
                <span>Explain Plan</span>
              </button>

              {/* Primary Run CTA */}
              <button
                type="button"
                onClick={handleRunQuery}
                disabled={isRunning}
                className="h-9 px-3.5 rounded-lg bg-[#9e3825] hover:bg-[#7e2110] border border-[#7e2110] text-white text-xs font-mono font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-70 active:translate-y-px"
              >
                <span className={`material-symbols-outlined text-[16px] ${isRunning ? 'animate-spin' : ''}`}>
                  {isRunning ? 'refresh' : 'play_arrow'}
                </span>
                <span className="tracking-wide">{isRunning ? 'Running...' : 'Run Query'}</span>
                <span className="text-[10px] text-white/75 hidden md:inline ml-0.5">Ctrl+Enter</span>
              </button>
            </div>
          </div>

          {/* Monospace Code Editor Pane */}
          <div className="relative bg-white rounded-lg border border-[#e8e7e4] shadow-xs overflow-hidden flex flex-col">
            {/* Editor Header Strip */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#f4f3f1] border-b border-[#e8e7e4] text-[#57423e]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#7e2110]">
                  terminal
                </span>
                <span className="text-xs font-mono font-medium text-[#1a1c1a]">
                  scratchpad_query_01.sql
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#7e2110]/40"></span>
                <span className="text-[10px] font-mono text-[#57423e]">UTF-8</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-[#57423e]">
                <span>Ln 6, Col 32</span>
                <span>Tab Size: 2</span>
              </div>
            </div>

            {/* Editor Gutter + Interactive Textarea */}
            <div className="relative flex min-h-[220px] font-mono text-sm leading-relaxed bg-[#faf8f5]">
              {/* Line Numbers */}
              <div className="w-12 select-none py-3.5 bg-[#f4f3f1]/50 text-[#8c7873]/70 text-right pr-3 text-xs space-y-1 border-r border-[#ecebe8]">
                {Array.from({ length: lineCount }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Code TextArea */}
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                spellCheck={false}
                className="flex-1 p-3.5 bg-transparent font-mono text-xs text-[#1a1c1a] focus:outline-none resize-none overflow-x-auto whitespace-pre leading-relaxed font-medium"
                rows={Math.max(7, lineCount)}
              />
            </div>

            {/* Optional: Explain Plan Drawer */}
            {showExplainPlan && (
              <div className="bg-[#e9e8e5] p-4 border-t border-[#dfdeda] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#633808]">
                      account_tree
                    </span>
                    <span className="text-sm font-semibold text-[#1a1c1a]">
                      Execution Plan: Cost Analysis
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#57423e]">
                    Optimizer: ALL_ROWS • Total Cost: 8.42
                  </span>
                </div>
                <div className="bg-white p-3 rounded border border-[#dfdeda] text-xs font-mono text-[#1a1c1a] overflow-x-auto space-y-1">
                  <div className="text-[#8c7873]">------------------------------------------------------------------------------------------</div>
                  <div>| Id | Operation                      | Name         | Rows | Bytes | Cost (%CPU) | Time     |</div>
                  <div className="text-[#8c7873]">------------------------------------------------------------------------------------------</div>
                  <div>|  0 | SELECT STATEMENT               |              |    4 |   312 |     8   (0) | 00:00:01 |</div>
                  <div>|  1 |   SORT ORDER BY                |              |    4 |   312 |     8   (0) | 00:00:01 |</div>
                  <div>|* 2 |     HASH JOIN                  |              |    4 |   312 |     7   (0) | 00:00:01 |</div>
                  <div>|* 3 |       TABLE ACCESS BY INDEX ROWID| ARTWORK      |    4 |   196 |     4   (0) | 00:00:01 |</div>
                  <div>|* 4 |         INDEX RANGE SCAN       | IDX_ART_PRC  |    6 |       |     2   (0) | 00:00:01 |</div>
                  <div>|  5 |       TABLE ACCESS FULL        | ARTIST       |   48 |  1392 |     3   (0) | 00:00:01 |</div>
                  <div className="text-[#8c7873]">------------------------------------------------------------------------------------------</div>
                  <div className="text-[#57423e] text-[11px] pt-1">Predicate Information: 2 - access("W"."ARTISTID"="A"."ARTISTID") | 4 - filter("W"."STATUS"='Exhibited')</div>
                </div>
              </div>
            )}
          </div>

          {/* Execution Telemetry Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white px-4 py-2.5 rounded-lg border border-[#e8e7e4] shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#2e6a4f]">
                  check_circle
                </span>
                <span className="text-xs font-mono text-[#1a1c1a] font-medium">
                  Query executed in <span className="text-[#2e6a4f] font-semibold">{executionTime}ms</span>
                </span>
              </div>
              <span className="text-[#dec0ba]">•</span>
              <span className="text-xs font-mono text-[#57423e]">
                {queryRows.length} rows returned
              </span>
              <span className="text-[#dec0ba]">•</span>
              <span className="text-xs font-mono text-[#57423e]">PostgreSQL 16 Engine</span>
            </div>

            {/* Export & Grid Manipulation Tools */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyJson}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#f4f3f1] hover:bg-[#e9e8e5] border border-[#e4e3df] text-[#1a1c1a] text-xs font-mono transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">content_copy</span>
                <span>Copy JSON</span>
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#f4f3f1] hover:bg-[#e9e8e5] border border-[#e4e3df] text-[#1a1c1a] text-xs font-mono transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">download</span>
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCompact(!isCompact)}
                className="p-1 rounded text-[#57423e] hover:bg-[#f4f3f1] transition-colors cursor-pointer border border-transparent hover:border-[#e4e3df]"
                title="Toggle table density"
              >
                <span className="material-symbols-outlined text-[18px]">density_medium</span>
              </button>
            </div>
          </div>

          {/* Tabular Data Results Grid */}
          <div className="bg-white rounded-lg border border-[#e8e7e4] shadow-xs overflow-hidden flex flex-col">
            {queryError && (
              <div className="p-3 bg-[#ffdad6] border-b border-[#ffb4ab] text-[#ba1a1a] text-xs font-mono flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{queryError}</span>
              </div>
            )}
            <div className="overflow-x-auto w-full max-h-[380px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f4f3f1] text-[#57423e] uppercase text-[10px] font-mono select-none sticky top-0 z-10 border-b border-[#e8e7e4]">
                    <th className="px-4 py-2.5 font-semibold tracking-wider w-12 text-center text-[#57423e]/60">
                      #
                    </th>
                    {columns.map((col) => (
                      <th key={col} className="px-4 py-2.5 font-semibold tracking-wider">
                        <div className="flex items-center gap-1">
                          <span>{col}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2f1ee] text-xs font-mono text-[#1a1c1a]">
                  {queryRows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-[#57423e] font-mono text-xs">
                        No rows returned from query.
                      </td>
                    </tr>
                  ) : (
                    queryRows.map((row, idx) => (
                      <tr
                        key={idx}
                        onClick={() => setSelectedRowId(idx)}
                        className={`transition-colors cursor-pointer ${
                          selectedRowId === idx
                            ? 'bg-[#e9e8e5]'
                            : 'hover:bg-[#f4f3f1]/70'
                        }`}
                      >
                        <td className="px-4 py-2.5 text-center text-[#57423e] text-[11px]">
                          {idx + 1}
                        </td>
                        {columns.map((col) => {
                          const val = row[col];
                          const displayVal = val === null || val === undefined ? 'NULL' : String(val);
                          return (
                            <td key={col} className={`px-4 ${isCompact ? 'py-1.5' : 'py-2.5'}`}>
                              {col === 'status' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-[#eaf2ec] text-[#2e6a4f] font-mono font-semibold">
                                  {displayVal}
                                </span>
                              ) : col === 'price' && typeof val === 'number' ? (
                                <span className="text-[#633808] font-bold tabular-nums">
                                  ${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                              ) : (
                                <span>{displayVal}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination & Footer */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#f4f3f1]/60 border-t border-[#e8e7e4] text-[#57423e] text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px]">
                  Showing 1–{queryRows.length} of {queryRows.length} results
                </span>
                <span className="text-[#dec0ba]">|</span>
                <span className="font-mono text-[11px]">Relational tuples verified</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-xs">
                <button
                  type="button"
                  disabled
                  className="p-1 rounded text-[#57423e]/40 cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                <span className="px-2 py-0.5 rounded bg-[#efeeeb] text-[#1a1c1a] font-medium border border-[#dedcd7]">
                  Page 1 of 1
                </span>
                <button
                  type="button"
                  disabled
                  className="p-1 rounded text-[#57423e]/40 cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Curatorial Data Architecture Visualizer Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-lg border border-[#e8e7e4] shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-[#f4f3f1] flex items-center justify-center text-[#7e2110] shrink-0 border border-[#e6e5e1]">
                <span className="material-symbols-outlined text-[18px]">dataset</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-[#1a1c1a] truncate">
                  Referential Constraint
                </span>
                <span className="text-[11px] font-mono text-[#57423e] truncate">
                  FK_ARTWORK_ARTIST_01
                </span>
                <span className="text-[10px] font-mono text-[#2e6a4f] font-semibold">
                  ON DELETE RESTRICT
                </span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e8e7e4] shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-[#f4f3f1] flex items-center justify-center text-[#633808] shrink-0 border border-[#e6e5e1]">
                <span className="material-symbols-outlined text-[18px]">speed</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-[#1a1c1a] truncate">
                  Cost Estimate
                </span>
                <span className="text-[11px] font-mono text-[#57423e] truncate">
                  I/O Wait: 1.2ms (Zero disk spill)
                </span>
                <span className="text-[10px] font-mono text-[#57423e]">
                  Hash Match Engine: Verified
                </span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e8e7e4] shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-[#f4f3f1] flex items-center justify-center text-[#9e3825] shrink-0 border border-[#e6e5e1]">
                <span className="material-symbols-outlined text-[18px]">history</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-[#1a1c1a] truncate">
                  Catalog Transaction
                </span>
                <span className="text-[11px] font-mono text-[#57423e] truncate">
                  SCN: 1482910398 • Read Committed
                </span>
                <span className="text-[10px] font-mono text-[#57423e]">
                  Isolation: Snapshot Safe
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
