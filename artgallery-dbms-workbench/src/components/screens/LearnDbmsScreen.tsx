import React, { useState } from 'react';

interface LearnDbmsScreenProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const LearnDbmsScreen: React.FC<LearnDbmsScreenProps> = ({ onShowToast }) => {
  const [activeTopic, setActiveTopic] = useState<'normalization' | 'algebra' | 'acid' | 'indexing'>('normalization');
  const [normStep, setNormStep] = useState<'1nf' | '2nf' | '3nf' | 'bcnf'>('1nf');

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#9e3825]"></span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#57423e] font-semibold">
            Curatorial Curriculum &amp; Relational Theory
          </span>
        </div>
        <h1 className="text-3xl font-bold text-[#1a1c1a] tracking-tight">
          Learn DBMS: Foundations &amp; Oracle 23ai Architecture
        </h1>
        <p className="text-sm text-[#57423e] max-w-3xl">
          Deep-dive into formal relational calculus, Boyce-Codd Normal Form, ACID isolation schedules, and modern AI vector index algorithms.
        </p>
      </div>

      {/* Topic Switcher */}
      <div className="flex items-center gap-2 border-b border-[#e8e7e4] pb-2">
        <button
          onClick={() => setActiveTopic('normalization')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTopic === 'normalization'
              ? 'bg-[#9e3825] text-white shadow-xs'
              : 'text-[#57423e] hover:bg-[#e9e8e5] hover:text-[#1a1c1a]'
          }`}
        >
          Normalization (1NF → BCNF)
        </button>
        <button
          onClick={() => setActiveTopic('algebra')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTopic === 'algebra'
              ? 'bg-[#9e3825] text-white shadow-xs'
              : 'text-[#57423e] hover:bg-[#e9e8e5] hover:text-[#1a1c1a]'
          }`}
        >
          Relational Algebra (σ, π, ⨝)
        </button>
        <button
          onClick={() => setActiveTopic('acid')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTopic === 'acid'
              ? 'bg-[#9e3825] text-white shadow-xs'
              : 'text-[#57423e] hover:bg-[#e9e8e5] hover:text-[#1a1c1a]'
          }`}
        >
          ACID &amp; Transaction Anomalies
        </button>
        <button
          onClick={() => setActiveTopic('indexing')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTopic === 'indexing'
              ? 'bg-[#9e3825] text-white shadow-xs'
              : 'text-[#57423e] hover:bg-[#e9e8e5] hover:text-[#1a1c1a]'
          }`}
        >
          B*Tree &amp; AI Vector Indexing
        </button>
      </div>

      {/* Topic 1: Normalization */}
      {activeTopic === 'normalization' && (
        <div className="bg-white rounded-xl border border-[#e8e7e4] p-6 shadow-xs flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#f0eeea] pb-4">
            <div>
              <h2 className="text-xl font-bold text-[#1a1c1a]">
                Interactive Normalization Workbench
              </h2>
              <p className="text-xs text-[#57423e] mt-1">
                Step through how an unnormalized spreadsheet of art acquisitions decomposes into functional dependencies without redundancy.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-[#f4f3f1] p-1 rounded-lg border border-[#e5e4e0]">
              {(['1nf', '2nf', '3nf', 'bcnf'] as const).map((step) => (
                <button
                  key={step}
                  onClick={() => {
                    setNormStep(step);
                    onShowToast(`Evaluated ${step.toUpperCase()} dependency constraints`, 'info');
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                    normStep === step
                      ? 'bg-[#7e2110] text-white shadow-2xs'
                      : 'text-[#57423e] hover:text-[#1a1c1a]'
                  }`}
                >
                  {step.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Normal Form Details */}
          {normStep === '1nf' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#fdf2f0] border border-[#f2cfc7]">
                <h3 className="font-bold text-sm text-[#7e2110]">
                  First Normal Form (1NF): Atomic Values &amp; No Repeating Groups
                </h3>
                <p className="text-xs text-[#57423e] mt-1 leading-relaxed">
                  Every attribute domain must contain only atomic (indivisible) values. Multi-valued attributes like <code className="bg-white px-1 py-0.5 rounded text-[#7e2110] font-mono">ArtMediums = "Oil, Linen, Bronze"</code> or repeating column blocks must be flattened into single-valued relations with a unique primary key.
                </p>
              </div>

              <div className="bg-[#faf9f6] p-4 rounded-lg border border-[#e8e7e4] font-mono text-xs">
                <span className="text-[#7e2110] font-bold">-- 1NF Transformation DDL</span><br />
                CREATE TABLE Artworks_1NF (<br />
                &nbsp;&nbsp;ArtworkID NUMBER PRIMARY KEY,<br />
                &nbsp;&nbsp;Title VARCHAR2(100),<br />
                &nbsp;&nbsp;ArtistID VARCHAR2(16),<br />
                &nbsp;&nbsp;Medium VARCHAR2(50), <span className="text-[#2e6a4f]">-- Single scalar value</span><br />
                &nbsp;&nbsp;Price DECIMAL(12,2)<br />
                );
              </div>
            </div>
          )}

          {normStep === '2nf' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#eaf2ec] border border-[#b8dfc4]">
                <h3 className="font-bold text-sm text-[#2e6a4f]">
                  Second Normal Form (2NF): Elimination of Partial Dependencies
                </h3>
                <p className="text-xs text-[#57423e] mt-1 leading-relaxed">
                  Must be in 1NF and every non-prime attribute must be <strong>fully functionally dependent</strong> on the entire primary key. In a composite key relation <code className="bg-white px-1 py-0.5 rounded font-mono">(ArtworkID, ExhibitionID)</code>, attributes like <code className="font-mono">ArtistName</code> depend only on <code className="font-mono">ArtworkID</code>, causing update anomalies.
                </p>
              </div>
              <div className="bg-[#faf9f6] p-4 rounded-lg border border-[#e8e7e4] font-mono text-xs">
                <span className="text-[#2e6a4f] font-bold">-- Decomposing into 2NF Relations</span><br />
                CREATE TABLE Exhibition_Assignments (<br />
                &nbsp;&nbsp;ArtworkID NUMBER REFERENCES Artworks(id),<br />
                &nbsp;&nbsp;ExhibitionID NUMBER REFERENCES Exhibitions(id),<br />
                &nbsp;&nbsp;DisplayRoom VARCHAR2(30),<br />
                &nbsp;&nbsp;PRIMARY KEY (ArtworkID, ExhibitionID)<br />
                );
              </div>
            </div>
          )}

          {normStep === '3nf' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#fff8e1] border border-[#ffe082]">
                <h3 className="font-bold text-sm text-[#b87a1b]">
                  Third Normal Form (3NF): Elimination of Transitive Dependencies
                </h3>
                <p className="text-xs text-[#57423e] mt-1 leading-relaxed">
                  Must be in 2NF and no non-prime attribute can depend on another non-prime attribute (If <code className="font-mono">A → B</code> and <code className="font-mono">B → C</code>, then <code className="font-mono">A → C</code> is transitive). E.g. <code className="font-mono">ArtworkID → ArtistID → ArtistCountry</code>: Country must live in the separate <code className="font-mono">ARTISTS</code> table!
                </p>
              </div>
              <div className="bg-[#faf9f6] p-4 rounded-lg border border-[#e8e7e4] font-mono text-xs">
                <span className="text-[#b87a1b] font-bold">-- 3NF Separation: ARTISTS table extracted</span><br />
                CREATE TABLE Artists (ArtistID PRIMARY KEY, ArtistName, Country);<br />
                CREATE TABLE Artworks (ArtworkID PRIMARY KEY, Title, ArtistID REFERENCES Artists(ArtistID));
              </div>
            </div>
          )}

          {normStep === 'bcnf' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#e3f2fd] border border-[#90caf9]">
                <h3 className="font-bold text-sm text-[#1565c0]">
                  Boyce-Codd Normal Form (BCNF): Strict Superkey Determinants
                </h3>
                <p className="text-xs text-[#57423e] mt-1 leading-relaxed">
                  A stronger version of 3NF where for every non-trivial functional dependency <code className="font-mono">X → Y</code>, <code className="font-mono">X</code> must be a superkey. Guarantees zero redundancy from functional dependencies.
                </p>
              </div>
              <div className="bg-[#faf9f6] p-4 rounded-lg border border-[#e8e7e4] font-mono text-xs">
                <span className="text-[#1565c0] font-bold">-- BCNF Certified Schema</span><br />
                Every determinant in the ArtGallery repository (<code className="text-[#7e2110]">ArtistID</code>, <code className="text-[#7e2110]">ArtworkID</code>, <code className="text-[#7e2110]">CuratorID</code>) is a verified primary key!
              </div>
            </div>
          )}
        </div>
      )}

      {/* Topic 2: Relational Algebra */}
      {activeTopic === 'algebra' && (
        <div className="bg-white rounded-xl border border-[#e8e7e4] p-6 shadow-xs flex flex-col gap-6">
          <h2 className="text-xl font-bold text-[#1a1c1a]">Relational Algebra Operator Sandbox</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[#f4f3f1] border border-[#e8e7e4]">
              <span className="text-lg font-bold text-[#7e2110] font-mono">Selection (σ)</span>
              <p className="text-xs text-[#57423e] mt-1">Filters horizontal rows based on predicate logic.</p>
              <pre className="mt-2 text-xs font-mono bg-white p-2.5 rounded border border-[#e2e1dc]">
                σ_(price &gt; 500000 ∧ status = 'Exhibited')(ARTWORKS)
              </pre>
            </div>

            <div className="p-4 rounded-lg bg-[#f4f3f1] border border-[#e8e7e4]">
              <span className="text-lg font-bold text-[#7e2110] font-mono">Projection (π)</span>
              <p className="text-xs text-[#57423e] mt-1">Extracts vertical column attributes and eliminates duplicates.</p>
              <pre className="mt-2 text-xs font-mono bg-white p-2.5 rounded border border-[#e2e1dc]">
                π_(name, country)(ARTISTS)
              </pre>
            </div>

            <div className="p-4 rounded-lg bg-[#f4f3f1] border border-[#e8e7e4]">
              <span className="text-lg font-bold text-[#7e2110] font-mono">Natural Join (⨝)</span>
              <p className="text-xs text-[#57423e] mt-1">Combines tuples based on shared common attribute equality.</p>
              <pre className="mt-2 text-xs font-mono bg-white p-2.5 rounded border border-[#e2e1dc]">
                ARTISTS ⨝_(ARTISTS.id = ARTWORKS.artist_id) ARTWORKS
              </pre>
            </div>

            <div className="p-4 rounded-lg bg-[#f4f3f1] border border-[#e8e7e4]">
              <span className="text-lg font-bold text-[#7e2110] font-mono">Division (÷)</span>
              <p className="text-xs text-[#57423e] mt-1">Answers "Find all artists who have artworks in ALL exhibitions".</p>
              <pre className="mt-2 text-xs font-mono bg-white p-2.5 rounded border border-[#e2e1dc]">
                π_(artist_id, exhibition_id)(EXHIBIT_ITEMS) ÷ π_(id)(EXHIBITIONS)
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Topic 3: ACID */}
      {activeTopic === 'acid' && (
        <div className="bg-white rounded-xl border border-[#e8e7e4] p-6 shadow-xs flex flex-col gap-6">
          <h2 className="text-xl font-bold text-[#1a1c1a]">ACID Guarantees &amp; Multi-Version Concurrency Control (MVCC)</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-[#f4f3f1] border border-[#e8e7e4]">
              <span className="text-sm font-bold font-mono text-[#7e2110]">Atomicity</span>
              <p className="text-xs text-[#57423e] mt-1">All-or-nothing execution. Rollback segments undo changes on failure.</p>
            </div>
            <div className="p-4 rounded-lg bg-[#f4f3f1] border border-[#e8e7e4]">
              <span className="text-sm font-bold font-mono text-[#7e2110]">Consistency</span>
              <p className="text-xs text-[#57423e] mt-1">Integrity constraints (PK, FK, CHECK) never violated at commit time.</p>
            </div>
            <div className="p-4 rounded-lg bg-[#f4f3f1] border border-[#e8e7e4]">
              <span className="text-sm font-bold font-mono text-[#7e2110]">Isolation</span>
              <p className="text-xs text-[#57423e] mt-1">Concurrent transactions execute without stepping on uncommitted writes.</p>
            </div>
            <div className="p-4 rounded-lg bg-[#f4f3f1] border border-[#e8e7e4]">
              <span className="text-sm font-bold font-mono text-[#7e2110]">Durability</span>
              <p className="text-xs text-[#57423e] mt-1">Committed transactions persist to Redo Logs even across hardware power cuts.</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#faf9f6] border border-[#e8e7e4]">
            <h4 className="font-bold text-xs font-mono uppercase text-[#1a1c1a]">Oracle 23ai Snapshot Isolation:</h4>
            <p className="text-xs text-[#57423e] mt-1 leading-relaxed">
              In Oracle Database, <strong>Readers do not block Writers, and Writers do not block Readers</strong>. Using System Change Numbers (SCN) and Undo Tablespaces, queries read consistent snapshots of the data as it existed when the statement began.
            </p>
          </div>
        </div>
      )}

      {/* Topic 4: Indexing */}
      {activeTopic === 'indexing' && (
        <div className="bg-white rounded-xl border border-[#e8e7e4] p-6 shadow-xs flex flex-col gap-6">
          <h2 className="text-xl font-bold text-[#1a1c1a]">Physical Index Architecture &amp; Oracle 23ai Vector Search</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-[#f4f3f1] border border-[#e8e7e4]">
              <span className="font-bold text-sm text-[#7e2110]">B*Tree Indices</span>
              <p className="text-xs text-[#57423e] mt-1">
                Balanced tree with root, branch, and leaf blocks containing sorted keys + ROWIDs. O(log N) lookup cost. Ideal for primary keys and price ranges.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[#f4f3f1] border border-[#e8e7e4]">
              <span className="font-bold text-sm text-[#7e2110]">Bitmap Indices</span>
              <p className="text-xs text-[#57423e] mt-1">
                Array of bits representing distinct low-cardinality column values (e.g. Status: Archived/Vaulted). Enables fast boolean bitwise AND/OR operations in OLAP.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[#f4f3f1] border border-[#e8e7e4]">
              <span className="font-bold text-sm text-[#7e2110]">AI Vector Search (HNSW)</span>
              <p className="text-xs text-[#57423e] mt-1">
                New in Oracle 23ai: Hierarchical Navigable Small World graphs for computing high-dimensional cosine similarity embeddings directly inside SQL queries!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
