import React, { useEffect, useState } from 'react';
import { api, SchemaTablePayload } from '../../services/api';
import { SCHEMA_TABLES } from '../../data/mockDatabase';

interface DatabaseExplorerScreenProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DatabaseExplorerScreen: React.FC<DatabaseExplorerScreenProps> = ({ onShowToast }) => {
  const [tables, setTables] = useState<SchemaTablePayload[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('ARTWORKS');
  const [activeTab, setActiveTab] = useState<'diagram' | 'ddl'>('diagram');

  useEffect(() => {
    api.schema()
      .then((data) => {
        if (data && data.length > 0) {
          setTables(data);
          if (!data.some((t) => t.name.toUpperCase() === selectedTable.toUpperCase())) {
            setSelectedTable(data[0].name.toUpperCase());
          }
        }
      })
      .catch(() => {});
  }, []);

  const displayTables = tables.length > 0
    ? tables.map((t) => ({
        name: t.name,
        rowsCount: t.rowsCount,
        columnsCount: t.columnsCount,
        description: t.description,
        columns: t.columns.map((c) => ({
          name: c.name,
          type: c.dataType,
          isPk: c.isPk,
          isFk: c.isFk,
          nullable: c.nullable
        }))
      }))
    : SCHEMA_TABLES;

  const activeSchema = displayTables.find((t) => t.name.toUpperCase() === selectedTable.toUpperCase()) || displayTables[0];

  const fullDdl = `-- ==========================================================
-- PostgreSQL 16 Archival Relational Schema (DDL)
-- Database: artgallery_db | Schema: public
-- Owner: artgallery_user
-- ==========================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_email CHECK (email = LOWER(email))
);

CREATE TABLE curators (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    department VARCHAR(80),
    email VARCHAR(120) NOT NULL UNIQUE,
    security_clearance VARCHAR(20) NOT NULL DEFAULT 'STANDARD'
        CHECK (security_clearance IN ('STANDARD', 'SENIOR', 'CHIEF')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE artists (
    id VARCHAR(16) PRIMARY KEY CHECK (id ~ '^ART-[0-9]{4,}$'),
    name VARCHAR(120) NOT NULL,
    country VARCHAR(60),
    country_code CHAR(3),
    active_period VARCHAR(60),
    bio TEXT,
    movement VARCHAR(100),
    image_url VARCHAR(512),
    verified_master BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE artworks (
    id SERIAL PRIMARY KEY,
    code VARCHAR(24) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    artist_id VARCHAR(16) NOT NULL,
    medium VARCHAR(100),
    dimensions VARCHAR(60),
    price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    year_created INTEGER CHECK (year_created IS NULL OR (year_created >= 1 AND year_created <= 2100)),
    status VARCHAR(20) NOT NULL DEFAULT 'Vaulted'
        CHECK (status IN ('Archived','Vaulted','In Transit','Exhibited','Acquired')),
    image_url VARCHAR(512),
    curator_id INTEGER,
    vault_location VARCHAR(60),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_appraisal_date DATE,
    CONSTRAINT fk_artworks_artist FOREIGN KEY (artist_id)
        REFERENCES artists(id) ON DELETE RESTRICT,
    CONSTRAINT fk_artworks_curator FOREIGN KEY (curator_id)
        REFERENCES curators(id) ON DELETE SET NULL
);

CREATE TABLE exhibitions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    curator_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    gallery_wing VARCHAR(80),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_exhibitions_dates CHECK (end_date >= start_date),
    CONSTRAINT fk_exhibitions_curator FOREIGN KEY (curator_id)
        REFERENCES curators(id) ON DELETE RESTRICT
);

CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    artwork_id INTEGER NOT NULL UNIQUE,
    buyer_name VARCHAR(120) NOT NULL,
    buyer_email VARCHAR(120),
    sale_price NUMERIC(12,2) NOT NULL CHECK (sale_price >= 0),
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    commission_rate NUMERIC(5,4) NOT NULL DEFAULT 0.15 CHECK (commission_rate >= 0 AND commission_rate <= 1),
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Completed','Cancelled','Refunded')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sales_artwork FOREIGN KEY (artwork_id)
        REFERENCES artworks(id) ON DELETE RESTRICT
);

CREATE TABLE query_history (
    id SERIAL PRIMARY KEY,
    sql_text TEXT NOT NULL,
    execution_time_ms INTEGER NOT NULL,
    rows_returned INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(10) NOT NULL DEFAULT 'success' CHECK (status IN ('success','error')),
    error_message TEXT,
    executed_by VARCHAR(120),
    executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indices for high-frequency queries
CREATE INDEX idx_artworks_artist ON artworks(artist_id);
CREATE INDEX idx_artworks_status ON artworks(status);
CREATE INDEX idx_artworks_price ON artworks(price);
CREATE INDEX idx_artworks_title ON artworks(title);
CREATE INDEX idx_query_history_time ON query_history(executed_at DESC);
`;

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9e3825]"></span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#57423e] font-semibold">
              PostgreSQL 16 Schema Modeler
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#1a1c1a] tracking-tight">
            Database Explorer &amp; ER Modeler
          </h1>
          <p className="text-sm text-[#57423e]">
            Visual entity-relationship graph, referential integrity cascade paths, and schema DDL generator.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#f4f3f1] p-1 rounded-lg border border-[#e5e4e0] flex items-center gap-1">
            <button
              onClick={() => setActiveTab('diagram')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'diagram'
                  ? 'bg-white text-[#7e2110] shadow-2xs'
                  : 'text-[#57423e] hover:text-[#1a1c1a]'
              }`}
            >
              Entity Diagram
            </button>
            <button
              onClick={() => setActiveTab('ddl')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'ddl'
                  ? 'bg-white text-[#7e2110] shadow-2xs'
                  : 'text-[#57423e] hover:text-[#1a1c1a]'
              }`}
            >
              Full DDL Script
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'diagram' ? (
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Main Diagram Canvas (Col 8) */}
          <div className="col-span-12 xl:col-span-8 bg-white rounded-xl border border-[#e8e7e4] shadow-xs p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[#f0eeea] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7e2110]">schema</span>
                <span className="text-sm font-bold text-[#1a1c1a]">
                  Entity-Relationship Graph (Crow’s Foot Notation)
                </span>
              </div>
              <span className="text-xs font-mono text-[#57423e]">
                {displayTables.length} Entities • Live Catalog
              </span>
            </div>

            {/* Visual ER Diagram Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayTables.map((table) => {
                const isSelected = selectedTable === table.name;
                return (
                  <div
                    key={table.name}
                    onClick={() => {
                      setSelectedTable(table.name);
                      onShowToast(`Selected entity: ${table.name}`, 'info');
                    }}
                    className={`rounded-lg border transition-all cursor-pointer overflow-hidden ${
                      isSelected
                        ? 'border-[#7e2110] shadow-md ring-1 ring-[#7e2110]'
                        : 'border-[#e8e7e4] hover:border-[#9e3825] hover:shadow-xs'
                    }`}
                  >
                    {/* Entity Header */}
                    <div
                      className={`px-3 py-2 flex items-center justify-between font-mono text-xs ${
                        isSelected
                          ? 'bg-[#7e2110] text-white'
                          : 'bg-[#f4f3f1] text-[#1a1c1a]'
                      }`}
                    >
                      <span className="font-bold">{table.name}</span>
                      <span className="text-[10px] opacity-80">
                        {table.rowsCount} rows • {table.columnsCount} cols
                      </span>
                    </div>

                    {/* Columns Preview */}
                    <div className="p-3 bg-white flex flex-col gap-1 text-xs font-mono divide-y divide-[#f5f4f0]">
                      {table.columns.slice(0, 5).map((col) => (
                        <div
                          key={col.name}
                          className="pt-1 first:pt-0 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-1.5">
                            {col.isPk ? (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-[#ffdad3] text-[#7e2110] font-bold">
                                PK
                              </span>
                            ) : col.isFk ? (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-[#ffdcc0] text-[#633808] font-bold">
                                FK
                              </span>
                            ) : (
                              <span className="w-2.5"></span>
                            )}
                            <span className="text-[#1a1c1a] font-medium">{col.name}</span>
                          </div>
                          <span className="text-[10px] text-[#57423e]">{col.type}</span>
                        </div>
                      ))}
                      {table.columns.length > 5 && (
                        <div className="pt-1 text-[10px] text-[#8c7873] italic">
                          + {table.columns.length - 5} more columns...
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Relationship Connectors Explanation */}
            <div className="p-4 rounded-lg bg-[#f4f3f1] border border-[#e8e7e4] flex flex-col gap-2 text-xs">
              <span className="font-bold text-[#1a1c1a]">Relational Cardinality Links:</span>
              <ul className="space-y-1 text-[#57423e] list-disc list-inside">
                <li>
                  <strong className="text-[#1a1c1a]">ARTISTS (1) ───&lt; (M) ARTWORKS</strong>: One artist produces zero-to-many catalogued artworks. Referential constraint enforced by <code className="text-[#7e2110] font-mono">ON DELETE RESTRICT</code>.
                </li>
                <li>
                  <strong className="text-[#1a1c1a]">CURATORS (1) ───&lt; (M) EXHIBITIONS</strong>: Each exhibition has one managing curator signatory.
                </li>
                <li>
                  <strong className="text-[#1a1c1a]">CURATORS (1) ───&lt; (M) ARTWORKS</strong>: Conservators assigned to high-value appraisals (<code className="text-[#633808] font-mono">ON DELETE SET NULL</code>).
                </li>
              </ul>
            </div>
          </div>

          {/* Right Inspector (Col 4) */}
          <div className="col-span-12 xl:col-span-4 bg-white rounded-xl border border-[#e8e7e4] shadow-xs p-5 flex flex-col gap-4 sticky top-20">
            <div className="flex items-center justify-between pb-2 border-b border-[#f0eeea]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#57423e]">Entity Inspector</span>
                <h3 className="text-lg font-bold text-[#1a1c1a] font-mono">{activeSchema.name}</h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#e9e8e5] text-[#57423e] font-semibold">
                {activeSchema.rowsCount} tuples
              </span>
            </div>

            <p className="text-xs text-[#57423e] leading-relaxed">
              {activeSchema.description}
            </p>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono font-bold text-[#1a1c1a]">Attributes &amp; Constraints</span>
              <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
                {activeSchema.columns.map((col) => (
                  <div
                    key={col.name}
                    className="p-2 rounded bg-[#f4f3f1] border border-[#e6e5e1] flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-1.5">
                      {col.isPk && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-[#ffdad3] text-[#7e2110] font-bold">
                          PK
                        </span>
                      )}
                      {col.isFk && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-[#ffdcc0] text-[#633808] font-bold">
                          FK
                        </span>
                      )}
                      <span className="text-[#1a1c1a] font-semibold">{col.name}</span>
                    </div>
                    <span className="text-[11px] text-[#57423e]">{col.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Full DDL View */
        <div className="bg-white rounded-xl border border-[#e8e7e4] shadow-xs p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1a1c1a]">PostgreSQL 16 Relational Schema DDL</h2>
            <button
              onClick={() => {
                navigator.clipboard.writeText(fullDdl);
                onShowToast('Copied full PostgreSQL 16 DDL script to clipboard', 'success');
              }}
              className="px-3 py-1.5 rounded bg-[#9e3825] hover:bg-[#7e2110] text-white text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              <span>Copy Full DDL</span>
            </button>
          </div>

          <pre className="p-4 rounded-lg bg-[#1c1d1c] text-[#f2f1ee] font-mono text-xs overflow-x-auto leading-relaxed border border-[#2f312f]">
            {fullDdl}
          </pre>
        </div>
      )}
    </div>
  );
};
