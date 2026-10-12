import React, { useCallback, useEffect, useState } from 'react';
import { Sidebar, NavItem } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { SqlPlaygroundScreen } from './components/screens/SqlPlaygroundScreen';
import { ArtistsArtworksScreen } from './components/screens/ArtistsArtworksScreen';
import { JdbcOdbcLabScreen } from './components/screens/JdbcOdbcLabScreen';
import { SignInScreen } from './components/screens/SignInScreen';
import { LearnDbmsScreen } from './components/screens/LearnDbmsScreen';
import { DatabaseExplorerScreen } from './components/screens/DatabaseExplorerScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { Toast, ToastData } from './components/common/Toast';
import { CommandPalette } from './components/common/CommandPalette';
import { api, ArtistPayload, DbUser, relativeTime } from './services/api';
import { Artist, Artwork, QueryHistoryItem } from './types/database';

/** Display model used by the sidebar / header. */
interface WorkbenchUser {
  name: string;
  role: string;
  avatarInitials: string;
  email: string;
}

function toDisplayUser(user: DbUser): WorkbenchUser {
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return {
    name: user.name,
    role: user.role === 'ADMIN' ? 'DB Admin' : 'Lab Student',
    avatarInitials: initials || 'AG',
    email: user.email,
  };
}

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<WorkbenchUser | null>(null);
  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');

  const [artists, setArtists] = useState<Artist[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [queries, setQueries] = useState<QueryHistoryItem[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dbPing, setDbPing] = useState<number | null>(null);

  const [activePlaygroundQuery, setActivePlaygroundQuery] = useState<string>('');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      setToast({ id: String(Date.now()), message, type });
      setTimeout(() => setToast(null), 3200);
    },
    []
  );

  // ------------------------------------------------------------- data loading

  const loadArtists = useCallback(async () => {
    const data = await api.artists.list();
    setArtists(
      data.map((a) => ({
        id: a.id,
        name: a.name,
        country: a.country ?? '',
        countryCode: a.countryCode ?? '',
        activePeriod: a.activePeriod ?? '',
        bio: a.bio ?? '',
        movement: a.movement ?? '',
        imageUrl: a.imageUrl ?? '',
        artworksCount: Number(a.artworksCount ?? 0),
        samplePieceTitle: a.samplePieceTitle ?? undefined,
      }))
    );
  }, []);

  const loadArtworks = useCallback(async () => {
    const data = await api.artworks.list();
    setArtworks(
      data.map((w) => ({
        id: w.id,
        code: w.code,
        title: w.title,
        artistId: w.artistId,
        artistName: w.artistName,
        medium: w.medium ?? '',
        dimensions: w.dimensions ?? undefined,
        price: Number(w.price),
        yearCreated: w.yearCreated ?? 0,
        status: (w.status as Artwork['status']) ?? 'Vaulted',
        imageUrl: w.imageUrl ?? '',
      }))
    );
  }, []);

  const loadQueries = useCallback(async () => {
    const data = await api.queryHistory();
    setQueries(
      data.map((q) => ({
        id: q.id,
        statusCode: q.status === 'success' ? '200 OK' : '400 ERR',
        timestamp: relativeTime(q.executedAt),
        sql: q.sql,
        executionTime: `${q.executionTimeMs}ms`,
        rowsReturned: q.rowsReturned,
        executedBy: q.executedBy ?? 'unknown',
      }))
    );
  }, []);

  const loadAll = useCallback(async () => {
    setDataLoading(true);
    try {
      await Promise.all([loadArtists(), loadArtworks(), loadQueries()]);
      try {
        const health = await api.health();
        setDbPing(health.status === 'UP' ? health.dbLatencyMs : null);
      } catch {
        setDbPing(null);
      }
    } finally {
      setDataLoading(false);
    }
  }, [loadArtists, loadArtworks, loadQueries]);

  // ------------------------------------------------------------ session check

  useEffect(() => {
    (async () => {
      try {
        const user = await api.auth.me();
        setCurrentUser(toDisplayUser(user));
        setIsAuthenticated(true);
        await loadAll();
      } catch {
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    })();
  }, [loadAll]);

  // ------------------------------------------------------------------ actions

  const handleSignInSuccess = async (user: DbUser) => {
    setCurrentUser(toDisplayUser(user));
    setIsAuthenticated(true);
    setCurrentTab('dashboard');
    await loadAll();
  };

  const handleSignOut = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Session may already be gone; clear the UI regardless.
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    setArtists([]);
    setArtworks([]);
    setQueries([]);
    showToast('Signed out of active DBMS session', 'info');
  };

  const handleOpenQueryInPlayground = (sql: string) => {
    setActivePlaygroundQuery(sql);
    setCurrentTab('sql-playground');
    showToast('Loaded query cursor into SQL Playground scratchpad', 'info');
  };

  const handleCreateArtist = async (payload: ArtistPayload): Promise<Artist> => {
    const created = await api.artists.create(payload);
    await loadArtists();
    return {
      id: created.id,
      name: created.name,
      country: created.country ?? '',
      countryCode: created.countryCode ?? '',
      activePeriod: created.activePeriod ?? '',
      bio: created.bio ?? '',
      movement: created.movement ?? '',
      imageUrl: created.imageUrl ?? '',
      artworksCount: Number(created.artworksCount ?? 0),
      samplePieceTitle: created.samplePieceTitle ?? undefined,
    };
  };

  const handleUpdateArtist = async (
    id: string,
    payload: ArtistPayload
  ): Promise<Artist> => {
    const updated = await api.artists.update(id, payload);
    await loadArtists();
    return {
      id: updated.id,
      name: updated.name,
      country: updated.country ?? '',
      countryCode: updated.countryCode ?? '',
      activePeriod: updated.activePeriod ?? '',
      bio: updated.bio ?? '',
      movement: updated.movement ?? '',
      imageUrl: updated.imageUrl ?? '',
      artworksCount: Number(updated.artworksCount ?? 0),
      samplePieceTitle: updated.samplePieceTitle ?? undefined,
    };
  };

  const handleDeleteArtist = async (artistId: string) => {
    await api.artists.remove(artistId);
    await Promise.all([loadArtists(), loadArtworks()]);
  };

  const handleResetData = async () => {
    const result = await api.admin.resetSeed();
    await loadAll();
    showToast(
      `Schema + seed re-applied: ${result.artists} artists, ${result.artworks} artworks restored`,
      'success'
    );
  };

  // ------------------------------------------------------------------ render

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#9e3825] text-white flex items-center justify-center shadow-xs animate-pulse">
          <span className="material-symbols-outlined text-[20px]">account_balance</span>
        </div>
        <p className="text-xs font-mono text-[#57423e] uppercase tracking-widest">
          Restoring DBMS session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <SignInScreen
          onSignInSuccess={handleSignInSuccess}
          onShowToast={showToast}
        />
        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1c1a] antialiased">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={
          currentUser ?? {
            name: 'Unknown',
            role: 'Guest',
            avatarInitials: 'AG',
          }
        }
        onSignOut={handleSignOut}
        pingMs={dbPing ?? undefined}
      />

      {/* Main Workspace Frame */}
      <div className="pl-60">
        {/* Fixed Top Workspace Header */}
        <Header
          currentUser={currentUser ?? { name: 'Unknown', role: 'Guest' }}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenHelp={() => setCurrentTab('learn-dbms')}
          onToggleNotifications={() =>
            showToast(
              `artgallery_db: ${artists.length} artists · ${artworks.length} artworks indexed`,
              'info'
            )
          }
          onSwitchUser={handleSignOut}
        />

        {/* Scrollable Main Application Content */}
        <main className="w-full pt-20 bg-[#faf9f6] min-h-[calc(100vh-4rem)] p-8">
          {currentTab === 'dashboard' && (
            <DashboardScreen
              artworks={artworks}
              queries={queries}
              onNavigate={setCurrentTab}
              onOpenQueryInPlayground={handleOpenQueryInPlayground}
              onOpenRegisterArtist={() => setCurrentTab('artists-&-artworks')}
              onShowToast={showToast}
              onRefreshQueries={loadQueries}
              onReindex={async () => {
                const result = await api.admin.analyze();
                return result.elapsedMs;
              }}
            />
          )}

          {currentTab === 'sql-playground' && (
            <SqlPlaygroundScreen
              initialQuery={activePlaygroundQuery}
              onShowToast={showToast}
              onExecuted={loadQueries}
            />
          )}

          {currentTab === 'artists-&-artworks' && (
            <ArtistsArtworksScreen
              artists={artists}
              artworks={artworks}
              loading={dataLoading}
              onRefresh={loadAll}
              onCreateArtist={handleCreateArtist}
              onUpdateArtist={handleUpdateArtist}
              onDeleteArtist={handleDeleteArtist}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'jdbc-&-odbc-lab' && (
            <JdbcOdbcLabScreen onShowToast={showToast} />
          )}

          {currentTab === 'learn-dbms' && (
            <LearnDbmsScreen onShowToast={showToast} />
          )}

          {currentTab === 'database-explorer' && (
            <DatabaseExplorerScreen onShowToast={showToast} />
          )}

          {currentTab === 'settings' && (
            <SettingsScreen
              onResetData={handleResetData}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Global Interactive Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setCurrentTab}
        onSelectQuery={(sql) => {
          setActivePlaygroundQuery(sql);
          setCurrentTab('sql-playground');
        }}
      />

      {/* Global Toast Notifications */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
