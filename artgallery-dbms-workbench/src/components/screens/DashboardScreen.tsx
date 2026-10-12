import React, { useEffect, useState } from 'react';
import { NavItem } from '../layout/Sidebar';
import { api, HealthInfo, StatsSummary } from '../../services/api';
import { Artwork, QueryHistoryItem } from '../../types/database';

interface DashboardScreenProps {
  artworks: Artwork[];
  queries: QueryHistoryItem[];
  onNavigate: (tab: NavItem) => void;
  onOpenQueryInPlayground: (sql: string) => void;
  onOpenRegisterArtist: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onRefreshQueries: () => Promise<void>;
  onReindex: () => Promise<number>;
}

function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
  return `$${value.toLocaleString()}`;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  artworks,
  queries,
  onNavigate,
  onOpenQueryInPlayground,
  onOpenRegisterArtist,
  onShowToast,
  onRefreshQueries,
  onReindex
}) => {
  const [isReindexing, setIsReindexing] = useState(false);
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [schemaCounts, setSchemaCounts] = useState<Record<string, number>>({});
  const [health, setHealth] = useState<HealthInfo | null>(null);
  const [isRefreshingQueries, setIsRefreshingQueries] = useState(false);

  useEffect(() => {
    api.stats().then(setStats).catch(() => setStats(null));
    api.health().then(setHealth).catch(() => setHealth(null));
    api.schema()
      .then((tables) => {
        const counts: Record<string, number> = {};
        tables.forEach((t) => (counts[t.name] = t.rowsCount));
        setSchemaCounts(counts);
      })
      .catch(() => setSchemaCounts({}));
  }, []);

  const handleReindex = async () => {
    setIsReindexing(true);
    onShowToast('Refreshing planner statistics on catalog tables (ANALYZE)...', 'info');
    try {
      const elapsedMs = await onReindex();
      onShowToast(`Catalog statistics re-synchronized via ANALYZE (${elapsedMs}ms)`, 'success');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'ANALYZE failed', 'error');
    } finally {
      setIsReindexing(false);
    }
  };

  const handleRefreshQueries = async () => {
    setIsRefreshingQueries(true);
    try {
      await onRefreshQueries();
      onShowToast('Query history reloaded from query_history table', 'success');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'Refresh failed', 'error');
    } finally {
      setIsRefreshingQueries(false);
    }
  };

  const recentArtworks = artworks.slice(0, 5);
  const totalRows =
    (stats?.totalArtists ?? 0) + (stats?.totalArtworks ?? 0);

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Title & Archival Subheader */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-1">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9e3825]"></span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#57423e] font-semibold">
              Archival Relational Ledger
            </span>
          </div>
          <h1 className="text-3xl text-[#1a1c1a] tracking-tight font-bold">
            Institutional Overview
          </h1>
          <p className="text-sm text-[#57423e] max-w-2xl">
            PostgreSQL 16 instance managing museum-grade attributions, acquisition provenance, and active execution cursors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#f4f3f1] border border-[#e4e3df] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#2e6a4f] animate-pulse"></span>
            <span className="text-xs font-mono text-[#1a1c1a] font-medium">
              SYS.ROWS: {String(totalRows).padStart(3, '0')}
            </span>
          </div>

          <button
            onClick={handleReindex}
            disabled={isReindexing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7e2110] hover:bg-[#9e3825] text-white rounded text-xs font-mono uppercase tracking-wider shadow-sm transition-all disabled:opacity-60 cursor-pointer"
            type="button"
          >
            <span
              className={`material-symbols-outlined text-[16px] ${
                isReindexing ? 'animate-spin' : ''
              }`}
            >
              sync
            </span>
            <span>{isReindexing ? 'Indexing...' : 'Re-index Catalog'}</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Artists */}
        <div className="bg-white p-4 rounded-lg border border-[#e8e7e4] shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#57423e] font-medium">
              Total Artists
            </span>
            <span className="material-symbols-outlined text-[#5a605c] text-[20px] group-hover:text-[#7e2110] transition-colors">
              recent_actors
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1a1c1a] tracking-tight">
              {stats?.totalArtists ?? '—'}
            </span>
            <span className="text-xs text-[#2e6a4f] font-mono flex items-center font-semibold">
              FROM <span className="text-[#57423e] ml-1 font-sans text-xs font-normal">artists table</span>
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f2f1ee] flex items-center justify-between text-[#57423e] text-xs font-mono">
            <span>Verified Masters</span>
            <span className="font-semibold text-[#1a1c1a]">
              {stats ? `${stats.verifiedMasters} Verified` : '—'}
            </span>
          </div>
        </div>

        {/* Catalog Artworks */}
        <div className="bg-white p-4 rounded-lg border border-[#e8e7e4] shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#57423e] font-medium">
              Catalog Artworks
            </span>
            <span className="material-symbols-outlined text-[#5a605c] text-[20px] group-hover:text-[#7e2110] transition-colors">
              museum
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1a1c1a] tracking-tight">
              {stats?.totalArtworks ?? '—'}
            </span>
            <span className="text-xs text-[#57423e] font-mono">
              Valuation {stats ? formatUsd(stats.totalValuation) : '—'}
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f2f1ee] flex items-center justify-between text-[#57423e] text-xs font-mono">
            <span>Deaccessioned</span>
            <span className="font-semibold text-[#1a1c1a]">
              {stats ? `${stats.archivedArtworks} Archived` : '—'}
            </span>
          </div>
        </div>

        {/* Average Valuation */}
        <div className="bg-white p-4 rounded-lg border border-[#e8e7e4] shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#57423e] font-medium">
              Average Valuation
            </span>
            <span className="material-symbols-outlined text-[#5a605c] text-[20px] group-hover:text-[#7e2110] transition-colors">
              paid
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#1a1c1a] tracking-tight">
              {stats ? formatUsd(stats.averageValuation) : '—'}
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f2f1ee] flex items-center justify-between text-[#57423e] text-xs font-mono">
            <span>Exhibited Works</span>
            <span className="font-semibold text-[#1a1c1a]">
              {stats ? `${stats.exhibitedArtworks} Exhibited` : '—'}
            </span>
          </div>
        </div>

        {/* System Reliability */}
        <div className="bg-white p-4 rounded-lg border border-[#e8e7e4] shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#57423e] font-medium">
              System Reliability
            </span>
            <span className={`material-symbols-outlined text-[20px] ${health?.status === 'UP' ? 'text-[#2e6a4f]' : 'text-[#ba1a1a]'}`}>
              {health?.status === 'UP' ? 'verified' : 'error'}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-bold tracking-tight ${health?.status === 'UP' ? 'text-[#2e6a4f]' : 'text-[#ba1a1a]'}`}>
              {health?.status === 'UP' ? '100%' : '0%'}
            </span>
            <span className="text-xs text-[#57423e] font-mono">Operational</span>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f2f1ee] flex items-center justify-between text-[#57423e] text-xs font-mono">
            <span>PostgreSQL 16 artgallery_db</span>
            <span className="font-mono text-[#2e6a4f] font-semibold">
              {health ? `${health.dbLatencyMs}ms` : '—'}
            </span>
          </div>
        </div>
      </section>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col (8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Table: Recent Catalog Acquisitions */}
          <div className="bg-white rounded-lg border border-[#e8e7e4] shadow-xs overflow-hidden">
            <div className="px-4 py-2.5 bg-[#f4f3f1] border-b border-[#e8e7e4] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#9e3825] text-[20px]">
                  inventory_2
                </span>
                <h2 className="text-base font-semibold text-[#1a1c1a]">
                  Recent Catalog Acquisitions
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#57423e] uppercase bg-[#efeeeb] px-2 py-0.5 rounded font-semibold border border-[#e0deda]">
                artworks (LIMIT 5)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#e9e8e5] text-[#57423e] text-[10px] font-mono uppercase tracking-wider border-b border-[#dfdeda]">
                    <th className="py-2.5 px-4 font-semibold">Piece & Registry</th>
                    <th className="py-2.5 px-3 font-semibold">Attribution</th>
                    <th className="py-2.5 px-3 font-semibold">Medium</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Valuation</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Provenance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2f1ee] text-xs">
                  {recentArtworks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 px-4 text-center text-[#57423e] font-mono text-xs">
                        No artworks loaded from the database yet.
                      </td>
                    </tr>
                  ) : (
                    recentArtworks.map((item) => {
                      const isArchived = item.status === 'Archived';
                      const isInTransit = item.status === 'In Transit';
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-[#f4f3f1]/70 transition-colors group cursor-pointer"
                          onClick={() => onNavigate('artists-&-artworks')}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                className="w-10 h-10 rounded object-cover shadow-2xs shrink-0 border border-[#e4e3df]"
                                alt={item.title}
                                src={item.imageUrl}
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-[#1a1c1a] group-hover:text-[#7e2110] transition-colors truncate">
                                  {item.title}
                                </span>
                                <span className="text-[11px] text-[#57423e] font-mono">
                                  {item.code}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-[#1a1c1a]">
                            <span className="font-medium">{item.artistName}</span>
                            <div className="text-[11px] text-[#57423e] font-mono">
                              #{item.artistId.replace('ART-', 'ID_')}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-[#5a605c]">
                            <span>{item.medium}</span>
                            <div className="text-[11px] text-[#57423e]">
                              {item.dimensions || 'Gallery Canvas'}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-sm text-[#1a1c1a] font-semibold tabular-nums">
                            ${item.price.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold inline-block ${
                                isArchived
                                  ? 'bg-[#eaf2ec] text-[#2e6a4f]'
                                  : isInTransit
                                  ? 'bg-[#fdf8ee] text-[#b87a1b]'
                                  : 'bg-[#e9e8e5] text-[#57423e]'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-[#f4f3f1] border-t border-[#e8e7e4] flex items-center justify-between">
              <span className="text-xs text-[#57423e] font-mono">
                Showing {recentArtworks.length} of {artworks.length} total artworks
              </span>
              <button
                onClick={() => onNavigate('artists-&-artworks')}
                className="text-xs text-[#7e2110] font-semibold hover:text-[#9e3825] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View Catalog Grid</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Table: Recent Executed Queries */}
          <div className="bg-white rounded-lg border border-[#e8e7e4] shadow-xs overflow-hidden">
            <div className="px-4 py-2.5 bg-[#f4f3f1] border-b border-[#e8e7e4] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#9e3825] text-[20px]">
                  terminal
                </span>
                <h2 className="text-base font-semibold text-[#1a1c1a]">
                  Recent Executed Queries
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#57423e] font-mono">query_history</span>
                <button
                  onClick={handleRefreshQueries}
                  disabled={isRefreshingQueries}
                  className="text-[#57423e] hover:text-[#1a1c1a] transition-colors p-1 rounded hover:bg-[#e9e8e5] disabled:opacity-50"
                  type="button"
                  title="Reload query history"
                >
                  <span className={`material-symbols-outlined text-[18px] ${isRefreshingQueries ? 'animate-spin' : ''}`}>refresh</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-[#f2f1ee]">
              {queries.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono text-[#57423e]">
                  No queries recorded yet — run a statement in the SQL Playground (ADMIN).
                </div>
              ) : (
                queries.map((q) => (
                  <div
                    key={q.id}
                    className="p-4 hover:bg-[#f4f3f1]/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#e9e8e5] text-[#57423e] font-semibold">
                          CURSOR #{q.id}
                        </span>
                        <span className={`text-[10px] font-mono font-semibold ${q.statusCode === '200 OK' ? 'text-[#2e6a4f]' : 'text-[#ba1a1a]'}`}>
                          {q.statusCode}
                        </span>
                        <span className="text-[11px] text-[#57423e]">· {q.timestamp}</span>
                      </div>

                      <pre className="text-xs font-mono bg-[#f4f3f1] p-2.5 rounded border border-[#e8e7e4] text-[#1a1c1a] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {q.sql}
                      </pre>

                      <div className="flex items-center gap-4 text-xs font-mono text-[#57423e]">
                        <span>
                          Execution: <strong className="text-[#1a1c1a]">{q.executionTime}</strong>
                        </span>
                        <span>
                          Rows: <strong className="text-[#1a1c1a]">{q.rowsReturned}</strong>
                        </span>
                        <span>
                          By: <strong className="text-[#1a1c1a]">{q.executedBy}</strong>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenQueryInPlayground(q.sql)}
                      className="shrink-0 self-start md:self-center px-3 py-1.5 rounded bg-[#efeeeb] hover:bg-[#7e2110] hover:text-white transition-all text-[#1a1c1a] text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 border border-[#e4e3df] cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                      <span>Playground</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col (4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-lg border border-[#e8e7e4] shadow-xs p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#f0eeea]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#9e3825] text-[20px]">
                  bolt
                </span>
                <h2 className="text-base font-semibold text-[#1a1c1a]">
                  Quick Actions
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#57423e]">CTL_PANEL</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => onNavigate('sql-playground')}
                className="p-3 rounded-lg bg-[#f4f3f1] hover:bg-[#e9e8e5] border border-[#e6e5e1] transition-all flex items-center justify-between group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#ffdad3] flex items-center justify-center text-[#3e0400] group-hover:bg-[#7e2110] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">terminal</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#1a1c1a]">
                      New SQL Worksheet
                    </span>
                    <span className="text-[11px] text-[#57423e]">
                      Interactive SQL Playground
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#57423e] group-hover:translate-x-0.5 transition-transform text-[18px]">
                  chevron_right
                </span>
              </button>

              <button
                onClick={onOpenRegisterArtist}
                className="p-3 rounded-lg bg-[#f4f3f1] hover:bg-[#e9e8e5] border border-[#e6e5e1] transition-all flex items-center justify-between group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#dfe4df] flex items-center justify-center text-[#5a605c] group-hover:bg-[#7e2110] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#1a1c1a]">
                      Register Artist
                    </span>
                    <span className="text-[11px] text-[#57423e]">
                      Insert into ARTISTS schema
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#57423e] group-hover:translate-x-0.5 transition-transform text-[18px]">
                  chevron_right
                </span>
              </button>

              <button
                onClick={() => onNavigate('artists-&-artworks')}
                className="p-3 rounded-lg bg-[#f4f3f1] hover:bg-[#e9e8e5] border border-[#e6e5e1] transition-all flex items-center justify-between group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#dfe4df] flex items-center justify-center text-[#5a605c] group-hover:bg-[#7e2110] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">
                      add_photo_alternate
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#1a1c1a]">
                      Catalog Artwork
                    </span>
                    <span className="text-[11px] text-[#57423e]">
                      Register piece with foreign key
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#57423e] group-hover:translate-x-0.5 transition-transform text-[18px]">
                  chevron_right
                </span>
              </button>

              <button
                onClick={() => onNavigate('jdbc-&-odbc-lab')}
                className="p-3 rounded-lg bg-[#f4f3f1] hover:bg-[#e9e8e5] border border-[#e6e5e1] transition-all flex items-center justify-between group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#ffdcc0] flex items-center justify-center text-[#2d1600] group-hover:bg-[#7e2110] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">
                      network_check
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#1a1c1a]">
                      Test JDBC / ODBC
                    </span>
                    <span className="text-[11px] text-[#57423e]">
                      Validate socket handshake
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#57423e] group-hover:translate-x-0.5 transition-transform text-[18px]">
                  chevron_right
                </span>
              </button>
            </div>
          </div>

          {/* Schema Overview Card */}
          <div className="bg-white rounded-lg border border-[#e8e7e4] shadow-xs p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#f0eeea]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#9e3825] text-[20px]">
                  account_tree
                </span>
                <h2 className="text-base font-semibold text-[#1a1c1a]">
                  Schema Overview
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#57423e]">public</span>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="p-3 rounded bg-[#f4f3f1] border border-[#e8e7e4] flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#1a1c1a]">
                    ARTISTS
                  </span>
                  <span className="text-[11px] text-[#57423e] font-mono">{schemaCounts['ARTISTS'] ?? '—'} rows</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#57423e]">
                  <span className="bg-[#efeeeb] px-1 py-0.5 rounded text-[#7e2110] font-semibold">
                    PK: id (VARCHAR)
                  </span>
                  <span>· 10 cols</span>
                </div>
              </div>

              <div className="p-3 rounded bg-[#f4f3f1] border border-[#e8e7e4] flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#1a1c1a]">
                    ARTWORKS
                  </span>
                  <span className="text-[11px] text-[#57423e] font-mono">{schemaCounts['ARTWORKS'] ?? '—'} rows</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#57423e]">
                  <span className="bg-[#efeeeb] px-1 py-0.5 rounded text-[#7e2110] font-semibold">
                    PK: id (SERIAL)
                  </span>
                  <span className="bg-[#efeeeb] px-1 py-0.5 rounded text-[#633808]">
                    FK: artist_id
                  </span>
                  <span>· 14 cols</span>
                </div>
              </div>

              <div className="p-3 rounded bg-[#f4f3f1] border border-[#e8e7e4] flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#1a1c1a]">
                    EXHIBITIONS
                  </span>
                  <span className="text-[11px] text-[#57423e] font-mono">{schemaCounts['EXHIBITIONS'] ?? '—'} rows</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#57423e]">
                  <span className="bg-[#efeeeb] px-1 py-0.5 rounded text-[#7e2110] font-semibold">
                    PK: id (SERIAL)
                  </span>
                  <span className="bg-[#efeeeb] px-1 py-0.5 rounded text-[#633808]">
                    FK: curator_id
                  </span>
                  <span>· 7 cols</span>
                </div>
              </div>

              <div className="p-3 rounded bg-[#f4f3f1] border border-[#e8e7e4] flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#1a1c1a]">
                    CURATORS
                  </span>
                  <span className="text-[11px] text-[#57423e] font-mono">{schemaCounts['CURATORS'] ?? '—'} rows</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#57423e]">
                  <span className="bg-[#efeeeb] px-1 py-0.5 rounded text-[#7e2110] font-semibold">
                    PK: id (SERIAL)
                  </span>
                  <span>· 6 cols</span>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={() => onNavigate('database-explorer')}
                className="w-full py-2 rounded bg-[#efeeeb] hover:bg-[#e3e2e0] border border-[#dedcd7] transition-colors text-xs text-[#1a1c1a] font-semibold font-mono flex items-center justify-center gap-2 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">schema</span>
                <span>Launch ER Diagram Modeler</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
