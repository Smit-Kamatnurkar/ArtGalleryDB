import React, { useMemo, useState } from 'react';
import { ArtistPayload } from '../../services/api';
import { Artist, Artwork } from '../../types/database';

interface ArtistsArtworksScreenProps {
  artists: Artist[];
  artworks: Artwork[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  onCreateArtist: (payload: ArtistPayload) => Promise<Artist>;
  onUpdateArtist: (id: string, payload: ArtistPayload) => Promise<Artist>;
  onDeleteArtist: (artistId: string) => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const PLACEHOLDER_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC9t5VQjyP4DmJG-Z0gpyQ4a_FsGom1Fxvww2eNmlx220e8m4TzElxH1uBvWn0I9Qm_Rr5-h8P2UhidelLTF5lRxT92kCoSMJHFhNefcl5hte0agHV52KcK5THwiAPrxFzkTDwtztMC7TxDStRIrYFJtZ3fdSuq1xAGeJ6egdQibiVuE-z-BgKTydsP8Sq7IfP2_zlJC5R7Zw1FeMpaHXZvIgetZffjwrswM5hdlURMM0Rk8Zrdbf4J';

/** Next free ART-XXXX business key derived from the loaded rows. */
function computeNextArtistId(artists: Artist[]): string {
  const maxSeq = artists.reduce((max, a) => {
    const match = /^ART-(\d+)$/.exec(a.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 80);
  return `ART-${String(maxSeq + 1).padStart(4, '0')}`;
}

export const ArtistsArtworksScreen: React.FC<ArtistsArtworksScreenProps> = ({
  artists,
  artworks,
  loading,
  onRefresh,
  onCreateArtist,
  onUpdateArtist,
  onDeleteArtist,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'artists' | 'artworks'>('artists');
  const [filterText, setFilterText] = useState('');
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Quick Add Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newCountry, setNewCountry] = useState('France');
  const [newPeriod, setNewPeriod] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedArtist = useMemo(() => {
    return (
      artists.find((a) => a.id === selectedArtistId) ??
      artists[0] ??
      ({} as Artist)
    );
  }, [artists, selectedArtistId]);

  const nextId = computeNextArtistId(artists);
  const formId = editingId ?? nextId;

  const filteredArtists = artists.filter(
    (a) =>
      a.name.toLowerCase().includes(filterText.toLowerCase()) ||
      a.country.toLowerCase().includes(filterText.toLowerCase()) ||
      a.id.toLowerCase().includes(filterText.toLowerCase()) ||
      a.bio.toLowerCase().includes(filterText.toLowerCase())
  );

  const filteredArtworks = artworks.filter(
    (w) =>
      w.title.toLowerCase().includes(filterText.toLowerCase()) ||
      w.artistName.toLowerCase().includes(filterText.toLowerCase()) ||
      w.medium.toLowerCase().includes(filterText.toLowerCase()) ||
      w.code.toLowerCase().includes(filterText.toLowerCase())
  );

  const paginatedArtists = filteredArtists.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.max(1, Math.ceil(filteredArtists.length / itemsPerPage));

  const handleSelectArtist = (artist: Artist) => {
    setSelectedArtistId(artist.id);
    onShowToast(`Loaded relational attributes for ${artist.name} (${artist.id})`, 'info');
  };

  const handleInspect = (artist: Artist) => {
    setSelectedArtistId(artist.id);
    setIsDrawerOpen(true);
  };

  const handleEdit = (artist: Artist) => {
    setEditingId(artist.id);
    setNewName(artist.name);
    setNewCountry(artist.country || 'France');
    setNewPeriod(artist.activePeriod || '');
    onShowToast(`Loaded ${artist.id} into workspace editing buffer (UPDATE mode)`, 'info');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewName('');
    setNewPeriod('');
    onShowToast('Edit buffer cleared', 'info');
  };

  const handleDelete = async (artist: Artist) => {
    if (
      !confirm(
        `DELETE FROM artists WHERE id = '${artist.id}'?\n\nThis permanently removes the tuple. Deletion is blocked by the foreign key if artworks still reference it.`
      )
    ) {
      return;
    }
    try {
      await onDeleteArtist(artist.id);
      onShowToast(`Deleted tuple ${artist.id} successfully`, 'success');
    } catch (err) {
      onShowToast(
        err instanceof Error ? err.message : 'DELETE failed',
        'error'
      );
    }
  };

  const handleCommitTuple = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      onShowToast('Schema Constraint Failure: ArtistName cannot be NULL', 'error');
      return;
    }

    setIsCommitting(true);
    const payload: ArtistPayload = {
      id: formId,
      name: newName.trim(),
      country: newCountry,
      countryCode: newCountry.slice(0, 3).toUpperCase(),
      activePeriod: newPeriod.trim() || 'Modern Era',
      bio: editingId
        ? undefined
        : 'Archived newly committed record in curatorial registry',
      imageUrl: editingId ? undefined : PLACEHOLDER_IMAGE
    };

    try {
      if (editingId) {
        const updated = await onUpdateArtist(editingId, payload);
        onShowToast(
          `UPDATE artists SET ... WHERE id = '${updated.id}' committed`,
          'success'
        );
        setSelectedArtistId(updated.id);
        setEditingId(null);
      } else {
        const created = await onCreateArtist(payload);
        onShowToast(
          `Committed tuple ${created.id} (${created.name}) into ARTISTS relation`,
          'success'
        );
        setSelectedArtistId(created.id);
      }
      setNewName('');
      setNewPeriod('');
    } catch (err) {
      onShowToast(
        err instanceof Error ? err.message : 'Statement failed',
        'error'
      );
    } finally {
      setIsCommitting(false);
    }
  };

  const handleResetForm = () => {
    setEditingId(null);
    setNewName('');
    setNewPeriod('');
    onShowToast('Add form fields reset', 'info');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      onShowToast('Relational tuples reloaded from PostgreSQL', 'success');
    } catch (err) {
      onShowToast(err instanceof Error ? err.message : 'Refresh failed', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const provenanceCompleteness =
    artists.length === 0
      ? 0
      : Math.round(
          (artists.filter((a) => (a.activePeriod ?? '').length > 0).length /
            artists.length) *
            100
        );

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Top Control Ribbon & Architecture Subheader */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-[#e8e7e4] shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* View Switcher Tabs */}
          <div className="flex items-center bg-[#e9e8e5] p-1 rounded-lg border border-[#dedcd7]">
            <button
              onClick={() => setActiveTab('artists')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'artists'
                  ? 'bg-white text-[#1a1c1a] shadow-xs'
                  : 'text-[#57423e] hover:text-[#1a1c1a]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] text-[#7e2110]">
                groups
              </span>
              <span>Artists Directory</span>
              <span className="ml-1 px-1.5 py-0.2 rounded bg-[#e9e8e5] text-[#57423e] text-[10px] font-mono">
                {artists.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('artworks')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'artworks'
                  ? 'bg-white text-[#1a1c1a] font-semibold shadow-xs'
                  : 'text-[#57423e] hover:text-[#1a1c1a]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">brush</span>
              <span>Artworks Catalog</span>
              <span className="ml-1 px-1.5 py-0.2 rounded bg-[#f4f3f1] text-[#57423e] text-[10px] font-mono">
                {artworks.length}
              </span>
            </button>
          </div>

          {/* Quick DDL Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#dfe4df] text-[#181d1a] border border-[#cfd5cf]">
            <span className="material-symbols-outlined text-[15px] text-[#7e2110]">
              database
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wide font-medium">
              SCHEMA: public.artists
            </span>
          </div>
        </div>

        {/* Search & New Record */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center min-w-[280px]">
            <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#57423e] pointer-events-none">
              filter_alt
            </span>
            <input
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter by name, country, or medium..."
              className="w-full pl-9 pr-8 py-2 rounded bg-[#f4f3f1] border border-[#e4e3df] text-[#1a1c1a] text-xs placeholder:text-[#57423e]/70 focus:outline-none focus:bg-white focus:border-[#9e3825] transition-all"
            />
            {filterText && (
              <button
                onClick={() => setFilterText('')}
                className="material-symbols-outlined absolute right-2.5 text-[16px] text-[#57423e] hover:text-[#1a1c1a]"
              >
                close
              </button>
            )}
          </div>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1 px-4 py-2 rounded bg-[#9e3825] hover:bg-[#7e2110] text-white text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">schema</span>
            <span>Inspect DDL</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'artists' ? (
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Left Column (8): Data Grid */}
          <div className="col-span-12 xl:col-span-8 flex flex-col gap-4">
            <div className="bg-white rounded-lg border border-[#e8e7e4] shadow-xs overflow-hidden flex flex-col">
              {/* Control Strip */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#f4f3f1] border-b border-[#e8e7e4]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase font-semibold text-[#57423e] tracking-wider">
                    Relational Tuple Stream
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7e2110]"></span>
                  <span className="text-xs font-mono text-[#1a1c1a]">
                    {loading
                      ? 'LOADING TUPLES...'
                      : `ENGINE_BUFFER: ${paginatedArtists.length} CACHED ROWS`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const csv = artists
                        .map((a) => `${a.id},"${a.name}","${a.country}","${a.activePeriod}",${a.artworksCount}`)
                        .join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'artists_export.csv';
                      a.click();
                      onShowToast('Exported artists catalog CSV', 'success');
                    }}
                    className="p-1 rounded text-[#57423e] hover:text-[#1a1c1a] hover:bg-[#e9e8e5] transition-colors"
                    title="Export CSV"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                  </button>
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="p-1 rounded text-[#57423e] hover:text-[#1a1c1a] hover:bg-[#e9e8e5] transition-colors"
                    title="Query Plan / DDL"
                  >
                    <span className="material-symbols-outlined text-[18px]">schema</span>
                  </button>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-1 rounded text-[#57423e] hover:text-[#1a1c1a] hover:bg-[#e9e8e5] transition-colors disabled:opacity-50"
                    title="Refresh Dataset (re-SELECT from PostgreSQL)"
                  >
                    <span className={`material-symbols-outlined text-[18px] ${isRefreshing ? 'animate-spin' : ''}`}>sync</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#e9e8e5] text-[#57423e] text-[10px] font-mono uppercase border-b border-[#dfdeda]">
                      <th className="py-2.5 px-4 font-semibold tracking-wider w-28">
                        Artist ID
                      </th>
                      <th className="py-2.5 px-4 font-semibold tracking-wider">
                        Artist Profile & Bio
                      </th>
                      <th className="py-2.5 px-4 font-semibold tracking-wider">
                        Country / Origin
                      </th>
                      <th className="py-2.5 px-4 font-semibold tracking-wider">
                        Active Period
                      </th>
                      <th className="py-2.5 px-4 font-semibold tracking-wider text-center">
                        Artworks
                      </th>
                      <th className="py-2.5 px-4 font-semibold tracking-wider text-right pr-6">
                        Operations
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2f1ee] text-xs text-[#1a1c1a]">
                    {paginatedArtists.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 px-4 text-center text-[#57423e] font-mono text-xs">
                          {loading
                            ? 'Fetching tuples from PostgreSQL...'
                            : 'No artist tuples match the current filter.'}
                        </td>
                      </tr>
                    ) : (
                      paginatedArtists.map((artist) => {
                        const initials = artist.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase();

                        const isSelected = selectedArtist?.id === artist.id;

                        return (
                          <tr
                            key={artist.id}
                            onClick={() => handleSelectArtist(artist)}
                            className={`transition-colors group cursor-pointer ${
                              isSelected ? 'bg-[#f4f3f1]' : 'hover:bg-[#f4f3f1]/60'
                            }`}
                          >
                            <td className="py-3 px-4 align-middle">
                              <div className="flex items-center gap-1">
                                <span className="px-1.5 py-0.5 rounded bg-[#e9e8e5] text-[#1a1c1a] font-mono text-[11px] font-semibold">
                                  {artist.id}
                                </span>
                                <span className="text-[9px] px-1 py-0.2 rounded bg-[#ffdcc0] text-[#2d1600] font-bold font-mono">
                                  PK
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 align-middle">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded bg-[#e9e8e5] text-[#7e2110] font-bold text-xs flex items-center justify-center shrink-0 border border-[#dfdeda]">
                                  {initials}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-[#1a1c1a] group-hover:text-[#7e2110] transition-colors">
                                    {artist.name}
                                  </span>
                                  <span className="text-[11px] text-[#57423e] line-clamp-1">
                                    {artist.bio}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 align-middle">
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-[#57423e]">
                                  public
                                </span>
                                <span className="font-medium text-[#1a1c1a]">
                                  {artist.country} ({artist.countryCode})
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 align-middle">
                              <span className="font-mono text-xs text-[#57423e]">
                                {artist.activePeriod}
                              </span>
                            </td>
                            <td className="py-3 px-4 align-middle text-center">
                              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#dfe4df] text-[#181d1a] font-mono text-xs font-semibold">
                                <span className="material-symbols-outlined text-[14px]">
                                  photo_library
                                </span>
                                <span>{artist.artworksCount}</span>
                              </div>
                            </td>
                            <td
                              className="py-3 px-4 align-middle text-right pr-6"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => handleInspect(artist)}
                                  className="p-1.5 rounded hover:bg-[#e9e8e5] text-[#57423e] hover:text-[#7e2110] transition-colors"
                                  title="Inspect Record Schema"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    visibility
                                  </span>
                                </button>
                                <button
                                  onClick={() => handleEdit(artist)}
                                  className="p-1.5 rounded hover:bg-[#e9e8e5] text-[#57423e] hover:text-[#1a1c1a] transition-colors"
                                  title="Edit Artist Tuple (UPDATE)"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    edit_square
                                  </span>
                                </button>
                                <button
                                  onClick={() => handleDelete(artist)}
                                  className="p-1.5 rounded hover:bg-[#ffdad6] text-[#57423e] hover:text-[#ba1a1a] transition-colors"
                                  title="Delete Tuple (FK RESTRICT enforced by PostgreSQL)"
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    delete
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-white border-t border-[#e8e7e4] text-[#57423e] text-xs">
                <div className="flex items-center gap-1 font-mono">
                  <span>Showing</span>
                  <span className="font-semibold text-[#1a1c1a]">
                    {filteredArtists.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} –{' '}
                    {Math.min(currentPage * itemsPerPage, filteredArtists.length)}
                  </span>
                  <span>of</span>
                  <span className="font-semibold text-[#1a1c1a]">
                    {filteredArtists.length}
                  </span>
                  <span>registered artists</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-2 py-1 rounded bg-[#f4f3f1] text-[#57423e] hover:text-[#1a1c1a] disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-[16px] align-middle">
                        chevron_left
                      </span>
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-2.5 py-1 rounded transition-colors ${
                          currentPage === i + 1
                            ? 'bg-[#9e3825] text-white font-bold shadow-2xs'
                            : 'hover:bg-[#f4f3f1] text-[#1a1c1a]'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="px-2 py-1 rounded bg-[#f4f3f1] text-[#57423e] hover:text-[#1a1c1a] disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-[16px] align-middle">
                        chevron_right
                      </span>
                    </button>
                  </div>
                  <div className="h-4 w-px bg-[#e9e8e5]"></div>
                  <span className="text-[10px] font-mono uppercase text-[#57423e]">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
              </div>
            </div>

            {/* Metric Cards Bottom */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-[#e8e7e4] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#57423e]">
                  <span className="text-[10px] font-mono uppercase font-semibold">
                    Unique Entities
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-[#633808]">
                    fingerprint
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#1a1c1a]">{artists.length}</span>
                  <span className="text-[10px] font-mono text-[#2e6a4f] bg-[#eaf2ec] px-1.5 py-0.5 rounded font-semibold">
                    PK Unique 100%
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#57423e]">
                  No duplicate hashes across primary keys
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-[#e8e7e4] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#57423e]">
                  <span className="text-[10px] font-mono uppercase font-semibold">
                    Foreign Key Pointers
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-[#7e2110]">
                    link
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#1a1c1a]">{artworks.length}</span>
                  <span className="text-[10px] font-mono text-[#57423e] bg-[#e9e8e5] px-1.5 py-0.5 rounded font-semibold">
                    ON DELETE RESTRICT
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#57423e]">
                  Orphan prevention active on artworks table
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-[#e8e7e4] shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#57423e]">
                  <span className="text-[10px] font-mono uppercase font-semibold">
                    Provenance Completeness
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-[#5a605c]">
                    verified
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#1a1c1a]">{provenanceCompleteness}%</span>
                  <span className="text-[10px] font-mono text-[#2e6a4f] bg-[#eaf2ec] px-1.5 py-0.5 rounded font-semibold">
                    Metadata Complete
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#57423e]">
                  Active periods & ISO countries verified
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (4): Quick Add Panel + Inspection Preview */}
          <div className="col-span-12 xl:col-span-4 flex flex-col gap-4 sticky top-20">
            {/* Quick Add Artist Form */}
            <div className="bg-white rounded-lg border border-[#e8e7e4] shadow-xs p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9e3825]"></span>
                  <h2 className="text-base font-semibold text-[#1a1c1a]">
                    {editingId ? 'Edit Artist Tuple' : 'Quick Add Artist'}
                  </h2>
                </div>
                {editingId ? (
                  <button
                    onClick={handleCancelEdit}
                    className="text-[10px] font-mono uppercase bg-[#ffdad6] text-[#ba1a1a] px-2 py-0.5 rounded border border-[#ffb4ab] font-bold cursor-pointer hover:bg-[#ffb4ab] transition-colors"
                  >
                    UPDATE MODE · CANCEL
                  </button>
                ) : (
                  <span className="text-[10px] font-mono uppercase bg-[#efeeeb] px-2 py-0.5 rounded text-[#57423e] border border-[#e2e1dc]">
                    Constraint Engine
                  </span>
                )}
              </div>

              {/* DDL Banner */}
              <div className="p-2.5 rounded bg-[#f4f3f1] border border-[#e8e7e4] flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-[#7e2110] text-xs font-semibold">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  <span>Relational Integrity Enforcer</span>
                </div>
                <div className="text-[11px] font-mono text-[#57423e] leading-relaxed">
                  Enforces <code className="text-[#7e2110] font-semibold">UNIQUE(id)</code> &{' '}
                  <code className="text-[#7e2110] font-semibold">NOT NULL(name)</code> before execution in transaction buffer.
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleCommitTuple} className="flex flex-col gap-3">
                {/* ID */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono uppercase font-semibold text-[#57423e]">
                      Artist ID <span className="text-[#7e2110]">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-[#57423e]">
                      {editingId ? 'Primary Key (fixed)' : 'Auto-Sequenced'}
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      readOnly
                      value={formId}
                      className="w-full bg-[#f4f3f1] border border-[#e4e3df] font-mono text-xs text-[#1a1c1a] px-3 py-2 rounded focus:outline-none cursor-not-allowed select-none"
                    />
                    <span className="material-symbols-outlined absolute right-2.5 text-[16px] text-[#57423e]">
                      lock
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono uppercase font-semibold text-[#57423e]">
                      Artist Name <span className="text-[#7e2110]">*</span>
                    </label>
                    <span className="text-[9px] font-mono text-[#ba1a1a] font-semibold">
                      NOT NULL REQUIRED
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Claude Monet"
                    className="w-full bg-white border border-[#d8d7d2] text-xs text-[#1a1c1a] px-3 py-2 rounded focus:outline-none focus:border-[#9e3825] transition-colors"
                  />
                </div>

                {/* Country */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono uppercase font-semibold text-[#57423e]">
                    Country / Origin
                  </label>
                  <div className="relative flex items-center">
                    <select
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      className="w-full bg-white border border-[#d8d7d2] text-xs text-[#1a1c1a] px-3 py-2 rounded appearance-none focus:outline-none focus:border-[#9e3825] transition-colors cursor-pointer"
                    >
                      <option value="France">France (FRA)</option>
                      <option value="Japan">Japan (JPN)</option>
                      <option value="Italy">Italy (ITA)</option>
                      <option value="Sweden">Sweden (SWE)</option>
                      <option value="India">India (IND)</option>
                      <option value="United Kingdom">United Kingdom (GBR)</option>
                      <option value="Netherlands">Netherlands (NLD)</option>
                      <option value="Mexico">Mexico (MEX)</option>
                      <option value="United States">United States (USA)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 text-[18px] text-[#57423e] pointer-events-none">
                      arrow_drop_down
                    </span>
                  </div>
                </div>

                {/* Active Period */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono uppercase font-semibold text-[#57423e]">
                    Active Era / Lifespan
                  </label>
                  <input
                    type="text"
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value)}
                    placeholder="e.g. 1840 – 1926"
                    className="w-full bg-white border border-[#d8d7d2] text-xs text-[#1a1c1a] px-3 py-2 rounded focus:outline-none focus:border-[#9e3825] transition-colors"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isCommitting || loading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-[#9e3825] hover:bg-[#7e2110] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-70"
                  >
                    <span className={`material-symbols-outlined text-[16px] ${isCommitting ? 'animate-spin' : ''}`}>
                      {isCommitting ? 'refresh' : editingId ? 'save' : 'add_circle'}
                    </span>
                    <span>
                      {isCommitting
                        ? 'Executing...'
                        : editingId
                        ? 'Commit UPDATE'
                        : 'Commit Tuple'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-3 py-2 rounded bg-[#f4f3f1] hover:bg-[#e9e8e5] text-[#57423e] text-xs font-medium border border-[#e4e3df] transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {/* Inspection Preview Card */}
            <div className="bg-white rounded-lg border border-[#e8e7e4] shadow-xs p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#f0eeea]">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#7e2110]">
                    analytics
                  </span>
                  <h3 className="text-sm font-semibold text-[#1a1c1a]">
                    Inspection Preview
                  </h3>
                </div>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-[#e9e8e5] text-[#1a1c1a] font-semibold">
                  {selectedArtist.id ?? '—'}
                </span>
              </div>

              {selectedArtist.id ? (
                <>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#57423e] text-[10px] font-mono uppercase">
                        Entity Identifier
                      </span>
                      <span className="font-mono font-semibold text-[#1a1c1a]">
                        {selectedArtist.id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#57423e] text-[10px] font-mono uppercase">
                        Canonical Name
                      </span>
                      <span className="font-semibold text-[#1a1c1a]">
                        {selectedArtist.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#57423e] text-[10px] font-mono uppercase">
                        Country / Provenance
                      </span>
                      <span className="text-[#1a1c1a]">{selectedArtist.country}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#57423e] text-[10px] font-mono uppercase">
                        Active Lifespan
                      </span>
                      <span className="font-mono text-[#1a1c1a]">{selectedArtist.activePeriod}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#57423e] text-[10px] font-mono uppercase">
                        Catalogue Artworks
                      </span>
                      <span className="font-mono text-[#7e2110] font-bold">
                        {selectedArtist.artworksCount} records
                      </span>
                    </div>
                  </div>

                  {/* Archival Artwork Image Matting */}
                  <div className="mt-1 flex flex-col gap-1.5 p-2 rounded bg-[#f4f3f1] border border-[#e8e7e4]">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="uppercase font-semibold text-[#57423e]">
                        Primary Archive Piece
                      </span>
                      <span className="text-[#57423e]">FK: artworks.artist_id</span>
                    </div>
                    <div className="w-full h-32 rounded overflow-hidden relative shadow-2xs border border-[#dedcd7] bg-[#eeede9]">
                      {selectedArtist.imageUrl ? (
                        <img
                          alt={selectedArtist.samplePieceTitle || selectedArtist.name}
                          src={selectedArtist.imageUrl}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#8c928e]">
                          <span className="material-symbols-outlined text-[28px]">image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
                        <span className="text-white text-xs font-semibold truncate drop-shadow-sm">
                          {selectedArtist.samplePieceTitle || `${selectedArtist.name} Specimen`}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-xs text-[#57423e] font-mono py-6 text-center">
                  Select an artist tuple to inspect its attributes.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Artworks Catalog View */
        <div className="bg-white rounded-lg border border-[#e8e7e4] shadow-xs overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-[#f4f3f1] border-b border-[#e8e7e4] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#7e2110] text-[20px]">
                palette
              </span>
              <h2 className="text-base font-semibold text-[#1a1c1a]">
                Artworks Master Catalog
              </h2>
            </div>
            <span className="text-xs font-mono text-[#57423e]">
              Showing {filteredArtworks.length} indexed records
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
            {filteredArtworks.length === 0 ? (
              <div className="col-span-full py-10 text-center text-xs font-mono text-[#57423e]">
                {loading ? 'Fetching artworks from PostgreSQL...' : 'No artworks match the current filter.'}
              </div>
            ) : (
              filteredArtworks.map((art) => (
                <div
                  key={art.id}
                  className="bg-white rounded-lg border border-[#e8e7e4] overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
                >
                  <div className="h-44 w-full bg-[#f4f3f1] relative overflow-hidden">
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span
                      className={`absolute top-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        art.status === 'Archived'
                          ? 'bg-[#eaf2ec] text-[#2e6a4f]'
                          : art.status === 'In Transit'
                          ? 'bg-[#fdf8ee] text-[#b87a1b]'
                          : art.status === 'Vaulted'
                          ? 'bg-[#e9e8e5] text-[#57423e]'
                          : 'bg-[#ffdad3] text-[#7e2110]'
                      }`}
                    >
                      {art.status}
                    </span>
                  </div>
                  <div className="p-3.5 flex flex-col gap-1.5 flex-1 justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-[#1a1c1a] group-hover:text-[#7e2110] transition-colors line-clamp-1">
                        {art.title}
                      </h4>
                      <p className="text-xs text-[#57423e]">{art.artistName}</p>
                      <p className="text-[11px] text-[#8c7873] mt-1">{art.medium} · {art.yearCreated}</p>
                    </div>
                    <div className="pt-2 border-t border-[#f2f1ee] flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#57423e]">{art.code}</span>
                      <span className="text-xs font-mono font-bold text-[#633808]">
                        ${art.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Slide-over Drawer: Data Schema Inspector */}
      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col justify-between border-l border-[#e8e7e4] animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-6 flex items-center justify-between border-b border-[#e8e7e4] bg-[#faf9f6]">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9e3825]"></span>
                  <h3 className="text-xl font-bold text-[#1a1c1a]">
                    Data Schema Inspector
                  </h3>
                </div>
                <span className="text-[10px] font-mono uppercase text-[#57423e] tracking-wider">
                  DBMS WORKBENCH // ROW OPERATIONS
                </span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded hover:bg-[#e9e8e5] text-[#57423e] hover:text-[#1a1c1a] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {/* DDL Preview Box */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase font-semibold text-[#57423e]">
                    Target Table Definition (DDL)
                  </span>
                  <span className="text-[10px] font-mono text-[#7e2110] font-bold">
                    POSTGRESQL 16 DDL
                  </span>
                </div>
                <div className="bg-[#e9e8e5] p-3.5 rounded-lg font-mono text-xs text-[#1a1c1a] overflow-x-auto leading-relaxed border border-[#dedcd7]">
                  <span className="text-[#7e2110] font-semibold">CREATE TABLE</span> artists (<br />
                  &nbsp;&nbsp;id <span className="text-[#7e2110] font-semibold">VARCHAR(16)</span> <span className="text-[#633808] font-semibold">PRIMARY KEY</span> <span className="text-[#633808] font-semibold">CHECK</span> (id ~ <span className="text-[#2e6a4f]">'^ART-[0-9]&#123;4,&#125;$'</span>),<br />
                  &nbsp;&nbsp;name <span className="text-[#7e2110] font-semibold">VARCHAR(120)</span> <span className="text-[#2e6a4f] font-semibold">NOT NULL</span>,<br />
                  &nbsp;&nbsp;country <span className="text-[#7e2110] font-semibold">VARCHAR(60)</span>,<br />
                  &nbsp;&nbsp;active_period <span className="text-[#7e2110] font-semibold">VARCHAR(60)</span>,<br />
                  &nbsp;&nbsp;bio <span className="text-[#7e2110] font-semibold">TEXT</span>,<br />
                  &nbsp;&nbsp;created_at <span className="text-[#7e2110] font-semibold">TIMESTAMP</span> <span className="text-[#633808]">DEFAULT CURRENT_TIMESTAMP</span><br />
                  );
                </div>
              </div>

              {/* Relational Dependency Tree */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-mono uppercase font-semibold text-[#57423e]">
                  Foreign Key Cascade Tree
                </span>
                <div className="p-3.5 rounded-lg bg-[#f4f3f1] border border-[#e8e7e4] flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-[#7e2110]">
                        table_chart
                      </span>
                      <span className="font-semibold text-[#1a1c1a] font-mono">
                        artworks (catalog_table)
                      </span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded bg-[#e9e8e5] text-[#1a1c1a] text-[10px] font-mono">
                      FK: artist_id
                    </span>
                  </div>
                  <div className="pl-6 text-[#57423e] text-xs flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#57423e]"></span>
                      <span>{artworks.length} Artwork entities depend directly on Artists PKs.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#57423e]"></span>
                      <span>Constraint fk_artworks_artist (ON DELETE RESTRICT) blocks tuple deletion when children exist.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Integrity Validation */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-mono uppercase font-semibold text-[#57423e]">
                  Live Integrity Validation
                </span>
                <div className="p-3.5 rounded-lg bg-white border border-[#e8e7e4] flex flex-col gap-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#1a1c1a]">Primary Key Uniqueness</span>
                    <span className="text-[#2e6a4f] font-mono font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Valid (PK constraint)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#1a1c1a]">Nullability Verification</span>
                    <span className="text-[#2e6a4f] font-mono font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      name NOT NULL
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#1a1c1a]">Encoding & Collation</span>
                    <span className="text-[#57423e] font-mono">UTF8</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-[#f4f3f1] border-t border-[#e8e7e4] flex items-center justify-between">
              <span className="text-xs font-mono text-[#57423e]">
                DB_STATUS: TRANSACTION_READY
              </span>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 rounded bg-[#e3e2e0] hover:bg-[#dbdad7] text-[#1a1c1a] text-xs font-semibold transition-colors cursor-pointer"
              >
                Dismiss Inspector
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
