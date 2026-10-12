import React, { useState } from 'react';

interface JdbcOdbcLabScreenProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

type TabType = 'setup' | 'jdbc' | 'odbc' | 'arch';

export const JdbcOdbcLabScreen: React.FC<JdbcOdbcLabScreenProps> = ({ onShowToast }) => {
  const [activeTab, setActiveTab] = useState<TabType>('jdbc');
  const [scenario, setScenario] = useState<'injection' | 'pool' | 'transaction'>('injection');
  const [isRunning, setIsRunning] = useState(false);
  const [terminalLog, setTerminalLog] = useState<string[]>([]);
  const [latencyText, setLatencyText] = useState('11ms execution');

  // Initial terminal output based on scenario
  const getInitialLogs = (sc: 'injection' | 'pool' | 'transaction') => {
    if (sc === 'injection') {
      return [
        "[09:42:01.102] Loading Oracle JDBC Driver class 'oracle.jdbc.OracleDriver'...",
        "[09:42:01.118] Connection pooled channel established via TLS 1.3 socket to localhost:1521",
        "[09:42:01.121] SQL PREPARE: SELECT artwork_id, title, acquisition_year, medium FROM artworks WHERE artist_id = ? AND status = ?",
        "[09:42:01.124] Parameter 1 Bound: INT 104 ('Auguste Rodin')",
        "[09:42:01.125] Parameter 2 Bound: VARCHAR2 'ARCHIVED_EXHIBIT'",
        "================== RELATIONAL RESULT SET (2 rows) ==================",
        "+------+---------------------------------+--------+--------------------+",
        "| ID   | TITLE                           | YEAR   | MEDIUM             |",
        "+------+---------------------------------+--------+--------------------+",
        "| 4012 | The Burghers of Calais          | 1889   | Cast Bronze        |",
        "| 4019 | The Thinker (Reduction)         | 1904   | Patinated Bronze   |",
        "+------+---------------------------------+--------+--------------------+",
        "✔ Query finished in 11ms. Auto-closed: PreparedStatement, ResultSet, Connection."
      ];
    } else if (sc === 'pool') {
      return [
        "[09:44:12.450] Initializing Oracle Universal Connection Pool (UCP)...",
        "[09:44:12.458] Pre-allocating 5 physical TCP sockets to :1521/FREEPDB1...",
        "[09:44:12.461] Pool ready. Available: 5, Active: 0, Max: 20",
        "[09:44:12.463] Leased connection: oracle.jdbc.driver.T4CConnection@7c53a9eb",
        "[09:44:12.464] Ping latency validation check succeeded (0ms round-trip).",
        "[09:44:12.465] Connection returned to pool on close(). Active: 0, Available: 5.",
        "✔ Handshake skipped. Reused persistent socket in 4ms."
      ];
    } else {
      return [
        "[09:46:00.012] conn.setAutoCommit(false) -> Opened Redo Log Transaction TX-90412",
        "[09:46:00.015] UPDATE artworks SET gallery_id = 12 WHERE artwork_id = 4012 (1 row affected)",
        "[09:46:00.019] Savepoint 'SP_LOG_START' established in Oracle System Undo Tablespace",
        "[09:46:00.022] INSERT INTO provenance_log (artwork_id, action) VALUES (4012, 'TRANSFER') (1 row affected)",
        "[09:46:00.026] conn.commit() executed. LGWR flushed dirty blocks to Online Redo Log.",
        "STATUS: COMMITTED (ISOLATION LEVEL: READ COMMITTED | SCN: 29402194)",
        "✔ ACID properties preserved. Both updates durable across storage layers in 16ms."
      ];
    }
  };

  React.useEffect(() => {
    setTerminalLog(getInitialLogs(scenario));
    setLatencyText(scenario === 'pool' ? '4ms (cached)' : scenario === 'transaction' ? '16ms execution' : '11ms execution');
  }, [scenario]);

  const handleRunCode = () => {
    setIsRunning(true);
    setTerminalLog([
      `[javac] Compiling GalleryArchivalQuery.java target 21 (bytecode verified)...`,
      `[jvm] Spawning virtual thread runner with Oracle UCP pool attachment...`
    ]);

    setTimeout(() => {
      setIsRunning(false);
      setTerminalLog(getInitialLogs(scenario));
      onShowToast(`Java program executed in ${latencyText}`, 'success');
    }, 450);
  };

  const handleClearTerminal = () => {
    setTerminalLog(['[jvm] Console buffer cleared. Click "Run Java Code" to run compilation suite.']);
  };

  return (
    <div className="flex flex-col w-full gap-5">
      {/* Top Academic Navigation */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#ffdad3] text-[#3e0400] font-mono text-xs uppercase tracking-wider font-bold">
              Module 07
            </span>
            <span className="text-xs text-[#57423e] font-medium">
              Relational Middleware &amp; Bridge Protocols
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-[#57423e]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2e6a4f]"></span>
              <span>JVM 21.0.3 LTS</span>
            </div>
            <span className="text-[#dec0ba]">/</span>
            <div>
              <span>ojdbc11.jar</span>
              <span className="text-[#633808] font-bold ml-1">(Type-4)</span>
            </div>
          </div>
        </div>

        {/* 4-Tab Segmented Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 p-1 rounded-xl bg-[#e9e8e5] border border-[#dedcd7] shadow-2xs">
          <button
            onClick={() => setActiveTab('setup')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'setup'
                ? 'bg-white text-[#7e2110] font-semibold shadow-xs'
                : 'text-[#57423e] hover:text-[#1a1c1a] hover:bg-white/50'
            }`}
          >
            <span className="text-[10px] opacity-60 font-mono">01</span>
            <span>Connection Setup</span>
          </button>

          <button
            onClick={() => setActiveTab('jdbc')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'jdbc'
                ? 'bg-white text-[#7e2110] font-bold shadow-xs'
                : 'text-[#57423e] hover:text-[#1a1c1a] hover:bg-white/50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#7e2110]"></span>
            <span className="text-[10px] font-mono">02</span>
            <span>JDBC Interactive Lab</span>
            <span className="px-1.5 py-0.2 rounded bg-[#7e2110]/10 text-[#7e2110] text-[9px] uppercase font-mono font-bold">
              Live
            </span>
          </button>

          <button
            onClick={() => setActiveTab('odbc')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'odbc'
                ? 'bg-white text-[#7e2110] font-semibold shadow-xs'
                : 'text-[#57423e] hover:text-[#1a1c1a] hover:bg-white/50'
            }`}
          >
            <span className="text-[10px] opacity-60 font-mono">03</span>
            <span>ODBC Lab &amp; DSN Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('arch')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'arch'
                ? 'bg-white text-[#7e2110] font-semibold shadow-xs'
                : 'text-[#57423e] hover:text-[#1a1c1a] hover:bg-white/50'
            }`}
          >
            <span className="text-[10px] opacity-60 font-mono">04</span>
            <span>Architecture Comparison</span>
          </button>
        </div>
      </div>

      {activeTab === 'jdbc' && (
        /* Main 2-Column Desktop Grid */
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Left Column (7): Editor + Terminal */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
            {/* Java Code Editor */}
            <div className="rounded-xl bg-white border border-[#e8e7e4] shadow-xs overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-4 py-2.5 bg-[#f4f3f1] border-b border-[#e8e7e4] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#7e2110] text-[20px]">
                    code
                  </span>
                  <span className="text-sm font-semibold text-[#1a1c1a]">
                    GalleryArchivalQuery.java
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#e9e8e5] text-[#57423e] text-[10px] font-mono">
                    java.sql.PreparedStatement
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <label className="text-[10px] font-mono uppercase text-[#57423e]">
                    Scenario:
                  </label>
                  <select
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value as any)}
                    className="bg-white border border-[#d8d7d2] text-[#1a1c1a] text-xs px-2.5 py-1 rounded focus:outline-none focus:border-[#9e3825] font-medium cursor-pointer"
                  >
                    <option value="injection">PreparedStatement (Injection Prevention)</option>
                    <option value="pool">DriverManager Connection Pool &amp; KeepAlive</option>
                    <option value="transaction">ACID Transaction Commit &amp; Savepoint Rollback</option>
                  </select>
                </div>
              </div>

              {/* Action Ribbon */}
              <div className="px-4 py-2 bg-[#efeeeb] border-b border-[#e4e3df] flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs font-mono text-[#57423e]">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-[#633808]">
                      lock
                    </span>
                    <span>Parameterized Plan Compilation</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-[#2e6a4f]">
                      verified_user
                    </span>
                    <span>AutoCloseable Resources</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setTerminalLog(getInitialLogs(scenario));
                      onShowToast('Editor template refreshed', 'info');
                    }}
                    className="px-2.5 py-1 rounded bg-white hover:bg-[#e9e8e5] border border-[#d8d7d2] text-[#57423e] text-xs font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    <span>Reset</span>
                  </button>
                  <button
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="px-3 py-1 rounded bg-[#7e2110] hover:bg-[#9e3825] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
                  >
                    <span className={`material-symbols-outlined text-[16px] ${isRunning ? 'animate-spin' : ''}`}>
                      {isRunning ? 'refresh' : 'play_arrow'}
                    </span>
                    <span>{isRunning ? 'Compiling...' : 'Run Java Code'}</span>
                  </button>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="p-4 bg-white font-mono text-xs text-[#1a1c1a] overflow-x-auto leading-relaxed select-text">
                {scenario === 'injection' && (
                  <div className="space-y-0.5">
                    <div><span className="text-[#8c7873] mr-3">01</span><span className="text-[#7e2110] font-bold">package</span> com.artgallery.dbms.lab;</div>
                    <div><span className="text-[#8c7873] mr-3">02</span><span className="text-[#7e2110] font-bold">import</span> java.sql.*;</div>
                    <div><span className="text-[#8c7873] mr-3">03</span></div>
                    <div><span className="text-[#8c7873] mr-3">04</span><span className="text-[#7e2110] font-bold">public class</span> <span className="font-bold">GalleryArchivalQuery</span> {'{'}</div>
                    <div><span className="text-[#8c7873] mr-3">05</span>  <span className="text-[#7e2110] font-bold">private static final</span> String URL = <span className="text-[#2e6a4f]">"jdbc:oracle:thin:@//localhost:1521/FREEPDB1"</span>;</div>
                    <div><span className="text-[#8c7873] mr-3">06</span></div>
                    <div><span className="text-[#8c7873] mr-3">07</span>  <span className="text-[#7e2110] font-bold">public static void</span> <span className="text-[#633808] font-semibold">main</span>(String[] args) {'{'}</div>
                    <div><span className="text-[#8c7873] mr-3">08</span>    String sql = <span className="text-[#2e6a4f]">"SELECT artwork_id, title, acquisition_year, medium "</span> +</div>
                    <div><span className="text-[#8c7873] mr-3">09</span>                 <span className="text-[#2e6a4f]">"FROM artworks WHERE artist_id = ? AND status = ?"</span>;</div>
                    <div><span className="text-[#8c7873] mr-3">10</span>    <span className="text-[#8c7873]">// Try-with-resources closes Connection, PreparedStatement, ResultSet</span></div>
                    <div><span className="text-[#8c7873] mr-3">11</span>    <span className="text-[#7e2110] font-bold">try</span> (Connection conn = DriverManager.<span className="text-[#633808]">getConnection</span>(URL, <span className="text-[#2e6a4f]">"dr_vance"</span>, <span className="text-[#2e6a4f]">"***"</span>);</div>
                    <div><span className="text-[#8c7873] mr-3">12</span>         PreparedStatement pstmt = conn.<span className="text-[#633808]">prepareStatement</span>(sql)) {'{'}</div>
                    <div><span className="text-[#8c7873] mr-3">13</span>      <span className="text-[#8c7873]">// Parameters compiled separately from SQL command syntax (prevents injection)</span></div>
                    <div><span className="text-[#8c7873] mr-3">14</span>      pstmt.<span className="text-[#633808]">setInt</span>(1, 104);</div>
                    <div><span className="text-[#8c7873] mr-3">15</span>      pstmt.<span className="text-[#633808]">setString</span>(2, <span className="text-[#2e6a4f]">"ARCHIVED_EXHIBIT"</span>);</div>
                    <div><span className="text-[#8c7873] mr-3">16</span>      <span className="text-[#7e2110] font-bold">try</span> (ResultSet rs = pstmt.<span className="text-[#633808]">executeQuery</span>()) {'{'}</div>
                    <div><span className="text-[#8c7873] mr-3">17</span>        <span className="text-[#7e2110] font-bold">while</span> (rs.<span className="text-[#633808]">next</span>()) {'{'}</div>
                    <div><span className="text-[#8c7873] mr-3">18</span>          System.out.<span className="text-[#633808]">printf</span>(<span className="text-[#2e6a4f]">"[%d] %s (%d) - %s%n"</span>, rs.<span className="text-[#633808]">getInt</span>(<span className="text-[#2e6a4f]">"artwork_id"</span>), rs.<span className="text-[#633808]">getString</span>(<span className="text-[#2e6a4f]">"title"</span>), rs.<span className="text-[#633808]">getInt</span>(<span className="text-[#2e6a4f]">"acquisition_year"</span>), rs.<span className="text-[#633808]">getString</span>(<span className="text-[#2e6a4f]">"medium"</span>));</div>
                    <div><span className="text-[#8c7873] mr-3">19</span>        {'}'}</div>
                    <div><span className="text-[#8c7873] mr-3">20</span>      {'}'}</div>
                    <div><span className="text-[#8c7873] mr-3">21</span>    {'}'} <span className="text-[#7e2110] font-bold">catch</span> (SQLException ex) {'{'} ex.<span className="text-[#633808]">printStackTrace</span>(); {'}'}</div>
                    <div><span className="text-[#8c7873] mr-3">22</span>  {'}'}</div>
                    <div><span className="text-[#8c7873] mr-3">23</span>{'}'}</div>
                  </div>
                )}

                {scenario === 'pool' && (
                  <div className="space-y-0.5">
                    <div><span className="text-[#8c7873] mr-3">01</span><span className="text-[#7e2110] font-bold">package</span> com.artgallery.dbms.lab;</div>
                    <div><span className="text-[#8c7873] mr-3">02</span><span className="text-[#7e2110] font-bold">import</span> oracle.ucp.jdbc.PoolDataSourceFactory;</div>
                    <div><span className="text-[#8c7873] mr-3">03</span><span className="text-[#7e2110] font-bold">import</span> oracle.ucp.jdbc.PoolDataSource;</div>
                    <div><span className="text-[#8c7873] mr-3">04</span><span className="text-[#7e2110] font-bold">public class</span> <span className="font-bold">GalleryConnectionPool</span> {'{'}</div>
                    <div><span className="text-[#8c7873] mr-3">05</span>  <span className="text-[#7e2110] font-bold">public static void</span> <span className="text-[#633808] font-semibold">main</span>(String[] args) <span className="text-[#7e2110] font-bold">throws</span> Exception {'{'}</div>
                    <div><span className="text-[#8c7873] mr-3">06</span>    PoolDataSource pds = PoolDataSourceFactory.<span className="text-[#633808]">getPoolDataSource</span>();</div>
                    <div><span className="text-[#8c7873] mr-3">07</span>    pds.<span className="text-[#633808]">setURL</span>(<span className="text-[#2e6a4f]">"jdbc:oracle:thin:@//localhost:1521/FREEPDB1"</span>);</div>
                    <div><span className="text-[#8c7873] mr-3">08</span>    pds.<span className="text-[#633808]">setUser</span>(<span className="text-[#2e6a4f]">"dr_vance"</span>); pds.<span className="text-[#633808]">setPassword</span>(<span className="text-[#2e6a4f]">"***"</span>);</div>
                    <div><span className="text-[#8c7873] mr-3">09</span>    pds.<span className="text-[#633808]">setInitialPoolSize</span>(5); pds.<span className="text-[#633808]">setMaxPoolSize</span>(20);</div>
                    <div><span className="text-[#8c7873] mr-3">10</span>    <span className="text-[#8c7873]">// Fast Connection Failover & KeepAlive heartbeats</span></div>
                    <div><span className="text-[#8c7873] mr-3">11</span>    <span className="text-[#7e2110] font-bold">try</span> (Connection conn = pds.<span className="text-[#633808]">getConnection</span>()) {'{'}</div>
                    <div><span className="text-[#8c7873] mr-3">12</span>      System.out.<span className="text-[#633808]">println</span>(<span className="text-[#2e6a4f]">"Leased physical connection from UCP: "</span> + conn);</div>
                    <div><span className="text-[#8c7873] mr-3">13</span>    {'}'}</div>
                    <div><span className="text-[#8c7873] mr-3">14</span>  {'}'}</div>
                    <div><span className="text-[#8c7873] mr-3">15</span>{'}'}</div>
                  </div>
                )}

                {scenario === 'transaction' && (
                  <div className="space-y-0.5">
                    <div><span className="text-[#8c7873] mr-3">01</span><span className="text-[#7e2110] font-bold">package</span> com.artgallery.dbms.lab;</div>
                    <div><span className="text-[#8c7873] mr-3">02</span><span className="text-[#7e2110] font-bold">public class</span> <span className="font-bold">ArtworkAcquisitionTransaction</span> {'{'}</div>
                    <div><span className="text-[#8c7873] mr-3">03</span>  <span className="text-[#7e2110] font-bold">public static void</span> <span className="text-[#633808] font-semibold">executeTransfer</span>(Connection conn) <span className="text-[#7e2110] font-bold">throws</span> SQLException {'{'}</div>
                    <div><span className="text-[#8c7873] mr-3">04</span>    conn.<span className="text-[#633808]">setAutoCommit</span>(<span className="text-[#7e2110] font-bold">false</span>); <span className="text-[#8c7873]">// Begin atomic boundary</span></div>
                    <div><span className="text-[#8c7873] mr-3">05</span>    Savepoint sp = conn.<span className="text-[#633808]">setSavepoint</span>(<span className="text-[#2e6a4f]">"SP_LOG_START"</span>);</div>
                    <div><span className="text-[#8c7873] mr-3">06</span>    <span className="text-[#7e2110] font-bold">try</span> {'{'}</div>
                    <div><span className="text-[#8c7873] mr-3">07</span>      <span className="text-[#8c7873]">// 1. Update artwork ownership</span></div>
                    <div><span className="text-[#8c7873] mr-3">08</span>      <span className="text-[#8c7873]">// 2. Insert audit log record</span></div>
                    <div><span className="text-[#8c7873] mr-3">09</span>      conn.<span className="text-[#633808]">commit</span>(); <span className="text-[#8c7873]">// ACID Commit durability</span></div>
                    <div><span className="text-[#8c7873] mr-3">10</span>    {'}'} <span className="text-[#7e2110] font-bold">catch</span> (SQLException e) {'{'}</div>
                    <div><span className="text-[#8c7873] mr-3">11</span>      conn.<span className="text-[#633808]">rollback</span>(); <span className="text-[#8c7873]">// Full atomicity protection</span></div>
                    <div><span className="text-[#8c7873] mr-3">12</span>      <span className="text-[#7e2110] font-bold">throw</span> e;</div>
                    <div><span className="text-[#8c7873] mr-3">13</span>    {'}'}</div>
                    <div><span className="text-[#8c7873] mr-3">14</span>  {'}'}</div>
                    <div><span className="text-[#8c7873] mr-3">15</span>{'}'}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Live Terminal / JVM Console */}
            <div className="rounded-xl bg-[#1c1d1c] text-[#f2f1ee] border border-[#2f312f] shadow-md overflow-hidden flex flex-col font-mono">
              <div className="px-4 py-2 bg-[#232523] flex items-center justify-between border-b border-[#2f312f]">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></span>
                  </div>
                  <span className="text-[10px] text-[#8c928e] uppercase tracking-wider ml-2">
                    JVM Standard Output &amp; Query Trace
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-[#8c928e]">
                  <span className="flex items-center gap-1 text-[#27c93f]">
                    <span className="material-symbols-outlined text-[14px]">speed</span>
                    <span>{latencyText}</span>
                  </span>
                  <button
                    onClick={handleClearTerminal}
                    className="hover:text-white transition-colors cursor-pointer text-xs"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="p-4 text-xs space-y-1.5 max-h-72 overflow-y-auto leading-normal text-[#dcdcdc] bg-[#1c1d1c]">
                {terminalLog.map((line, idx) => (
                  <div
                    key={idx}
                    className={`${
                      line.includes('✔')
                        ? 'text-[#27c93f] font-semibold pt-1'
                        : line.includes('SQL PREPARE')
                        ? 'text-[#fab97f] font-semibold'
                        : line.includes('Bound:')
                        ? 'text-[#a4e2b0]'
                        : line.includes('STATUS: COMMITTED')
                        ? 'text-[#fab97f]'
                        : line.includes('RESULT SET')
                        ? 'text-[#ffc4b8] font-bold'
                        : 'text-[#888888]'
                    } whitespace-pre-wrap`}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (5): Architecture + Security + Connection Spec */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
            {/* Architecture Card */}
            <div className="rounded-xl bg-white p-4 border border-[#e8e7e4] shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#7e2110] text-[20px]">
                    account_tree
                  </span>
                  <h2 className="text-sm font-bold text-[#1a1c1a]">
                    Type-4 Thin Protocol Stack
                  </h2>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#f4f3f1] text-[10px] font-mono text-[#57423e] uppercase border border-[#e4e3df]">
                  Zero Native Client
                </span>
              </div>

              <p className="text-xs text-[#57423e] leading-relaxed">
                Unlike ODBC which relies on native OS-level libraries (C/C++ runtime), Oracle Type-4 JDBC drivers are 100% pure Java, compiling wire-level TTC (Two-Task Common) network packets directly to port 1521.
              </p>

              {/* Vertical Flow */}
              <div className="p-2.5 rounded-lg bg-[#f4f3f1] border border-[#e8e7e4] flex flex-col gap-1.5 text-xs font-mono">
                {/* Node 1 */}
                <div className="flex items-center justify-between p-2 rounded bg-white border border-[#e4e3df] shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#9e3825] text-white flex items-center justify-center font-bold text-xs">
                      J
                    </div>
                    <div className="flex flex-col">
                      <span className="font-sans font-semibold text-[#1a1c1a]">ArtGallery Application</span>
                      <span className="text-[10px] text-[#57423e]">GalleryArchivalQuery.class</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#f4f3f1] px-1.5 py-0.5 rounded text-[#57423e]">Caller</span>
                </div>

                <div className="flex justify-center items-center py-0.5 text-[#8c7873]">
                  <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                  <span className="text-[9px] uppercase ml-1">java.sql.PreparedStatement</span>
                </div>

                {/* Node 2 */}
                <div className="flex items-center justify-between p-2 rounded bg-white border border-[#e4e3df] shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#efeeeb] text-[#633808] flex items-center justify-center font-bold text-[10px]">
                      API
                    </div>
                    <div className="flex flex-col">
                      <span className="font-sans font-semibold text-[#1a1c1a]">JDBC Core API Specification</span>
                      <span className="text-[10px] text-[#57423e]">java.sql.DriverManager / DataSource</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#ffdcc0] text-[#2d1600] px-1.5 py-0.5 rounded font-bold">Standard</span>
                </div>

                <div className="flex justify-center items-center py-0.5 text-[#8c7873]">
                  <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                  <span className="text-[9px] uppercase ml-1">ojdbc11 (Vendor Impl)</span>
                </div>

                {/* Node 3 */}
                <div className="flex items-center justify-between p-2 rounded bg-[#ffdad3] text-[#3e0400] border border-[#ffb4a5] shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#7e2110] text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px]">lan</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-sans font-bold">Oracle Type-4 Thin Driver</span>
                      <span className="text-[10px] opacity-80">oracle.jdbc.driver.OracleDriver</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-white text-[#7e2110] px-1.5 py-0.5 rounded font-bold">Pure Java</span>
                </div>

                <div className="flex justify-center items-center py-0.5 text-[#7e2110]">
                  <span className="material-symbols-outlined text-[14px]">sync_alt</span>
                  <span className="text-[9px] uppercase ml-1 font-bold">TTC Packet via TCP/IP Socket</span>
                </div>

                {/* Node 4 */}
                <div className="flex items-center justify-between p-2 rounded bg-white border border-[#e4e3df] shadow-2xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#2e6a4f] text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px]">database</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-sans font-semibold text-[#1a1c1a]">Oracle 23ai Pluggable DB</span>
                      <span className="text-[10px] text-[#57423e]">FREEPDB1 :1521 (Archival Schema)</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#eaf2ec] text-[#2e6a4f] px-1.5 py-0.5 rounded font-bold">RDBMS</span>
                </div>
              </div>
            </div>

            {/* Security Mechanics Callout */}
            <div className="rounded-xl bg-[#f4f3f1] p-4 border border-[#e8e7e4] flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-[#7e2110]">
                <span className="material-symbols-outlined text-[20px]">security</span>
                <h3 className="text-sm font-bold text-[#1a1c1a]">
                  Security Mechanics: Injection Defense
                </h3>
              </div>
              <p className="text-xs text-[#57423e] leading-relaxed">
                In a dynamic <code className="px-1 py-0.2 rounded bg-[#e9e8e5] font-mono text-[#633808]">Statement</code>, string concatenation permits malicious literals like <code className="px-1 py-0.2 rounded bg-[#ffdad6] text-[#ba1a1a] font-mono">' OR '1'='1</code> to modify the abstract syntax tree (AST).
              </p>

              <div className="p-2.5 rounded bg-white border border-[#e8e7e4] text-xs flex flex-col gap-1.5">
                <div className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[#2e6a4f] text-[16px] shrink-0 mt-0.5">
                    verified
                  </span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#1a1c1a]">PreparedStatement Two-Phase Cycle</span>
                    <span className="text-[#57423e] mt-0.5">
                      1. <strong>Pre-compilation:</strong> The DB parses SQL structure with parameter markers <code className="text-[#7e2110] font-mono font-bold">?</code>. Execution plan is locked.
                    </span>
                    <span className="text-[#57423e] mt-0.5">
                      2. <strong>Type Binding:</strong> Inputs are treated exclusively as literal data payloads, preventing structural syntactic hijacking.
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#57423e] pt-1">
                <span>OWASP Top 10 Mitigation: A03:2021</span>
                <span className="text-[#633808] font-semibold">Binds at Wire Layer</span>
              </div>
            </div>

            {/* Active Connection Spec */}
            <div className="rounded-xl bg-white p-4 border border-[#e8e7e4] shadow-xs flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#1a1c1a]">
                  Active Connection Spec
                </span>
                <span className="px-2 py-0.5 rounded bg-[#eaf2ec] text-[#2e6a4f] text-[10px] font-mono uppercase font-bold">
                  Verified
                </span>
              </div>

              <div className="flex flex-col gap-1.5 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded bg-[#f4f3f1] border border-[#e6e5e1]">
                  <span className="text-[#57423e]">JDBC URL</span>
                  <span className="font-semibold text-[#1a1c1a] text-right truncate max-w-[200px]">
                    jdbc:oracle:thin:@//localhost:1521/FREEPDB1
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#f4f3f1] border border-[#e6e5e1]">
                  <span className="text-[#57423e]">Driver Class</span>
                  <span className="font-semibold text-[#1a1c1a]">oracle.jdbc.OracleDriver</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#f4f3f1] border border-[#e6e5e1]">
                  <span className="text-[#57423e]">Auth Scheme</span>
                  <span className="font-semibold text-[#1a1c1a]">OAUTH2 / DB_APP_ROLE</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="p-2 rounded bg-[#f4f3f1] border border-[#e6e5e1] flex flex-col">
                    <span className="text-[10px] text-[#57423e] uppercase">Socket Latency</span>
                    <span className="text-base font-bold text-[#2e6a4f]">12 ms</span>
                  </div>
                  <div className="p-2 rounded bg-[#f4f3f1] border border-[#e6e5e1] flex flex-col">
                    <span className="text-[10px] text-[#57423e] uppercase">Active Pool Size</span>
                    <span className="text-base font-bold text-[#633808]">8 / 20</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 01: Setup Guide */}
      {activeTab === 'setup' && (
        <div className="bg-white rounded-xl border border-[#e8e7e4] p-6 flex flex-col gap-4 shadow-xs">
          <h2 className="text-lg font-bold text-[#1a1c1a]">01. Oracle JDBC Driver Environment &amp; Dependency Matrix</h2>
          <p className="text-sm text-[#57423e]">
            Configuring pure Java Type-4 thin client connectivity to an Oracle 23ai Pluggable Database (FREEPDB1).
          </p>

          <div className="bg-[#1c1d1c] text-[#f2f1ee] p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <span className="text-[#888888]">&lt;!-- Maven dependency in pom.xml --&gt;</span><br />
            &lt;<span className="text-[#ffb4a5]">dependency</span>&gt;<br />
            &nbsp;&nbsp;&lt;<span className="text-[#ffb4a5]">groupId</span>&gt;com.oracle.database.jdbc&lt;/<span className="text-[#ffb4a5]">groupId</span>&gt;<br />
            &nbsp;&nbsp;&lt;<span className="text-[#ffb4a5]">artifactId</span>&gt;ojdbc11&lt;/<span className="text-[#ffb4a5]">artifactId</span>&gt;<br />
            &nbsp;&nbsp;&lt;<span className="text-[#ffb4a5]">version</span>&gt;23.4.0.24.05&lt;/<span className="text-[#ffb4a5]">version</span>&gt;<br />
            &lt;/<span className="text-[#ffb4a5]">dependency</span>&gt;
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div className="p-4 rounded-lg bg-[#f4f3f1] border border-[#e8e7e4]">
              <h4 className="font-bold text-xs uppercase font-mono text-[#7e2110]">1. Driver Class Name</h4>
              <p className="text-xs text-[#57423e] mt-1 font-mono">oracle.jdbc.OracleDriver</p>
              <p className="text-[11px] text-[#8c7873] mt-2">Loaded dynamically via Class.forName() or automatically through Java SPI ServiceLoader.</p>
            </div>
            <div className="p-4 rounded-lg bg-[#f4f3f1] border border-[#e8e7e4]">
              <h4 className="font-bold text-xs uppercase font-mono text-[#7e2110]">2. Thin Connection URL</h4>
              <p className="text-xs text-[#57423e] mt-1 font-mono">jdbc:oracle:thin:@//host:port/service</p>
              <p className="text-[11px] text-[#8c7873] mt-2">Bypasses local Oracle Client (OCI) libraries; talks direct Two-Task Common (TTC) socket over TCP/IP.</p>
            </div>
            <div className="p-4 rounded-lg bg-[#f4f3f1] border border-[#e8e7e4]">
              <h4 className="font-bold text-xs uppercase font-mono text-[#7e2110]">3. Connection Pooling</h4>
              <p className="text-xs text-[#57423e] mt-1 font-mono">Oracle Universal Connection Pool (UCP)</p>
              <p className="text-[11px] text-[#8c7873] mt-2">Provides fast connection failover, statement caching, runtime load balancing, and thread-safe socket reuse.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 03: ODBC Lab & DSN Guide */}
      {activeTab === 'odbc' && (
        <div className="bg-white rounded-xl border border-[#e8e7e4] p-6 flex flex-col gap-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1a1c1a]">03. ODBC Data Source Name (DSN) &amp; C/C++ Architecture</h2>
            <span className="px-2 py-0.5 rounded bg-[#ffdcc0] text-[#2d1600] font-mono text-xs font-bold">
              odbc32.dll / unixODBC
            </span>
          </div>
          <p className="text-sm text-[#57423e]">
            Open Database Connectivity (ODBC) uses a C-based Call Level Interface (CLI) standardized by ISO/IEC 9075-3.
          </p>

          <div className="bg-[#1c1d1c] text-[#f2f1ee] p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
            <span className="text-[#888888]">// C / C++ ODBC Handshake using SQLDriverConnect()</span><br />
            SQLHENV henv; SQLHDBC hdbc; SQLHSTMT hstmt;<br />
            <span className="text-[#ffb4a5]">SQLAllocHandle</span>(SQL_HANDLE_ENV, SQL_NULL_HANDLE, &amp;henv);<br />
            <span className="text-[#ffb4a5]">SQLSetEnvAttr</span>(henv, SQL_ATTR_ODBC_VERSION, (SQLPOINTER)SQL_OV_ODBC3, 0);<br />
            <span className="text-[#ffb4a5]">SQLAllocHandle</span>(SQL_HANDLE_DBC, henv, &amp;hdbc);<br />
            <br />
            <span className="text-[#2e6a4f]">// Connection String via Oracle in OraDB23Home1 driver</span><br />
            SQLCHAR connStr[] = <span className="text-[#a4e2b0]">"Driver=&#123;Oracle 23ai&#125;;Dbq=localhost:1521/FREEPDB1;Uid=dr_vance;Pwd=***;"</span>;<br />
            <span className="text-[#ffb4a5]">SQLDriverConnect</span>(hdbc, NULL, connStr, SQL_NTS, NULL, 0, NULL, SQL_DRIVER_NOPROMPT);
          </div>

          <div className="p-4 rounded-lg bg-[#f4f3f1] border border-[#e8e7e4]">
            <h4 className="font-bold text-xs uppercase font-mono text-[#1a1c1a]">Key Difference from JDBC:</h4>
            <p className="text-xs text-[#57423e] mt-1 leading-relaxed">
              ODBC requires target OS binary driver installation (<code className="text-[#7e2110]">sqora32.dll</code> on Windows or <code className="text-[#7e2110]">libsqora.so</code> on Linux), making cross-platform containerization more complex than 100% pure Java JDBC jars.
            </p>
          </div>
        </div>
      )}

      {/* Tab 04: Architecture Comparison */}
      {activeTab === 'arch' && (
        <div className="bg-white rounded-xl border border-[#e8e7e4] p-6 flex flex-col gap-4 shadow-xs">
          <h2 className="text-lg font-bold text-[#1a1c1a]">04. Complete Driver Architecture Comparison (Type 1 – Type 4)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f4f3f1] text-[#57423e] font-mono uppercase text-[10px] border-b border-[#e8e7e4]">
                  <th className="p-3">Driver Classification</th>
                  <th className="p-3">Implementation</th>
                  <th className="p-3">Client OS Dependencies</th>
                  <th className="p-3">Performance &amp; Overhead</th>
                  <th className="p-3">Modern Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2f1ee]">
                <tr>
                  <td className="p-3 font-bold text-[#1a1c1a]">Type 1: JDBC-ODBC Bridge</td>
                  <td className="p-3 text-[#57423e]">Translates JDBC calls to ODBC calls</td>
                  <td className="p-3 text-[#ba1a1a] font-semibold">Requires native ODBC binary</td>
                  <td className="p-3 text-[#57423e]">Slowest (Double translation layer)</td>
                  <td className="p-3 text-[#ba1a1a] font-mono">Removed in Java 8</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-[#1a1c1a]">Type 2: Native-API (Partly Java)</td>
                  <td className="p-3 text-[#57423e]">Java JNI to native C/C++ DB client (e.g. OCI)</td>
                  <td className="p-3 text-[#ba1a1a] font-semibold">Requires Oracle Instant Client</td>
                  <td className="p-3 text-[#57423e]">Fast, but memory leak prone</td>
                  <td className="p-3 text-[#57423e] font-mono">Legacy enterprise only</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-[#1a1c1a]">Type 3: Network-Protocol Driver</td>
                  <td className="p-3 text-[#57423e]">All-Java client to middleware gateway</td>
                  <td className="p-3 text-[#2e6a4f] font-semibold">Zero client OS library</td>
                  <td className="p-3 text-[#57423e]">Moderate (Extra middleware hop)</td>
                  <td className="p-3 text-[#57423e] font-mono">Specialized proxy fleets</td>
                </tr>
                <tr className="bg-[#eaf2ec]/40">
                  <td className="p-3 font-bold text-[#2e6a4f]">Type 4: Direct-to-Database Thin</td>
                  <td className="p-3 text-[#2e6a4f] font-semibold">100% Pure Java socket (TTC packet)</td>
                  <td className="p-3 text-[#2e6a4f] font-bold">Zero OS native library needed</td>
                  <td className="p-3 text-[#2e6a4f] font-semibold">Highest efficiency &amp; portable</td>
                  <td className="p-3 text-[#2e6a4f] font-mono font-bold">Standard Industry Default</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
