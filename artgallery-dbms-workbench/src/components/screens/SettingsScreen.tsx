import React, { useState } from 'react';

interface SettingsScreenProps {
  onResetData: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onResetData, onShowToast }) => {
  const [poolSize, setPoolSize] = useState(20);
  const [initialPool, setInitialPool] = useState(5);
  const [timeoutSec, setTimeoutSec] = useState(30);
  const [enableVectorSearch, setEnableVectorSearch] = useState(true);
  const [enableBooleanDatatype, setEnableBooleanDatatype] = useState(true);
  const [auditLogging, setAuditLogging] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast('Database connection parameters saved and committed to listener configuration', 'success');
  };

  return (
    <div className="flex flex-col w-full gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#9e3825]"></span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#57423e] font-semibold">
            System Administration
          </span>
        </div>
        <h1 className="text-3xl font-bold text-[#1a1c1a] tracking-tight">
          Workbench &amp; Connection Settings
        </h1>
        <p className="text-sm text-[#57423e]">
          Manage Universal Connection Pool (UCP) allocations, Oracle 23ai engine dialect flags, and curatorial workspace defaults.
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Connection Pool Card */}
        <div className="bg-white rounded-xl border border-[#e8e7e4] p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#f0eeea] pb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#7e2110]">hub</span>
              <h2 className="text-base font-semibold text-[#1a1c1a]">
                Oracle Universal Connection Pool (UCP) Spec
              </h2>
            </div>
            <span className="text-xs font-mono text-[#57423e]">TTC Wire Protocol</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#1a1c1a]">Initial Pool Capacity</label>
              <input
                type="number"
                min={1}
                max={50}
                value={initialPool}
                onChange={(e) => setInitialPool(Number(e.target.value))}
                className="w-full bg-[#f4f3f1] border border-[#d8d7d2] px-3 py-2 rounded text-xs font-mono text-[#1a1c1a]"
              />
              <span className="text-[11px] text-[#57423e]">Pre-allocated TCP sockets on startup</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#1a1c1a]">Max Pool Ceiling</label>
              <input
                type="number"
                min={5}
                max={100}
                value={poolSize}
                onChange={(e) => setPoolSize(Number(e.target.value))}
                className="w-full bg-[#f4f3f1] border border-[#d8d7d2] px-3 py-2 rounded text-xs font-mono text-[#1a1c1a]"
              />
              <span className="text-[11px] text-[#57423e]">Max concurrent leased channels</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#1a1c1a]">Socket Timeout (Seconds)</label>
              <input
                type="number"
                min={5}
                max={300}
                value={timeoutSec}
                onChange={(e) => setTimeoutSec(Number(e.target.value))}
                className="w-full bg-[#f4f3f1] border border-[#d8d7d2] px-3 py-2 rounded text-xs font-mono text-[#1a1c1a]"
              />
              <span className="text-[11px] text-[#57423e]">Max wait time before SQLException</span>
            </div>
          </div>
        </div>

        {/* Oracle 23ai Engine Features */}
        <div className="bg-white rounded-xl border border-[#e8e7e4] p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#f0eeea] pb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#7e2110]">settings_suggest</span>
              <h2 className="text-base font-semibold text-[#1a1c1a]">
                Oracle Database 23ai Dialect Capabilities
              </h2>
            </div>
            <span className="text-[10px] font-mono bg-[#eaf2ec] text-[#2e6a4f] px-2 py-0.5 rounded font-bold">
              23ai Active
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between p-3 rounded-lg bg-[#f4f3f1] border border-[#e8e7e4] cursor-pointer">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#1a1c1a]">AI Vector Search (VECTOR Datatype)</span>
                <span className="text-[11px] text-[#57423e]">Enable high-dimensional embeddings and cosine distance indexing</span>
              </div>
              <input
                type="checkbox"
                checked={enableVectorSearch}
                onChange={(e) => setEnableVectorSearch(e.target.checked)}
                className="w-4 h-4 accent-[#9e3825]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-[#f4f3f1] border border-[#e8e7e4] cursor-pointer">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#1a1c1a]">Native BOOLEAN Datatype</span>
                <span className="text-[11px] text-[#57423e]">Allow TRUE / FALSE values directly in SQL expressions without NUMBER(1) hacks</span>
              </div>
              <input
                type="checkbox"
                checked={enableBooleanDatatype}
                onChange={(e) => setEnableBooleanDatatype(e.target.checked)}
                className="w-4 h-4 accent-[#9e3825]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-[#f4f3f1] border border-[#e8e7e4] cursor-pointer">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#1a1c1a]">Unified Audit Trail Logging</span>
                <span className="text-[11px] text-[#57423e]">Record all DDL updates, cursor invocations, and session grants to SYS.UNIFIED_AUDIT_TRAIL</span>
              </div>
              <input
                type="checkbox"
                checked={auditLogging}
                onChange={(e) => setAuditLogging(e.target.checked)}
                className="w-4 h-4 accent-[#9e3825]"
              />
            </label>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset catalog database to initial demo state?')) {
                onResetData();
                onShowToast('Catalog reset to initial demo seeds', 'success');
              }
            }}
            className="px-4 py-2 rounded bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffb4ab] text-xs font-bold transition-colors cursor-pointer"
          >
            Reset Database Seed Records
          </button>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-[#9e3825] hover:bg-[#7e2110] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Save Configuration Changes
          </button>
        </div>
      </form>
    </div>
  );
};
