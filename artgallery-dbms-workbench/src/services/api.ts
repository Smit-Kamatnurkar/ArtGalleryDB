/**
 * Central REST client for the ArtGallery Spring Boot backend.
 *
 * Every call uses `credentials: 'include'` so the HttpOnly JSESSIONID
 * session cookie set by Spring Security travels with each request.
 */

const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers ?? {}),
      },
    });
  } catch {
    // Network-level failure (backend not running, CORS, DNS, ...)
    throw new ApiError(
      0,
      'Cannot reach the backend server. Is it running on port 8080?'
    );
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data && typeof data.message === 'string') {
        message = data.message;
      }
    } catch {
      // Non-JSON error body — keep the generic message.
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

// ---------------------------------------------------------------------------
// Wire types (mirrors of the backend DTO records)
// ---------------------------------------------------------------------------

export interface DbUser {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
}

export interface ArtistPayload {
  id?: string;
  name: string;
  country?: string;
  countryCode?: string;
  activePeriod?: string;
  bio?: string;
  movement?: string;
  imageUrl?: string;
}

export interface ArtistResponsePayload {
  id: string;
  name: string;
  country?: string;
  countryCode?: string;
  activePeriod?: string;
  bio?: string;
  movement?: string;
  imageUrl?: string;
  artworksCount?: number;
  samplePieceTitle?: string;
}

export interface HealthInfo {
  status: 'UP' | 'DOWN';
  database: string;
  jdbcUrl: string;
  driver: string;
  dbLatencyMs: number;
  artists: number;
  artworks: number;
  error?: string;
}

export interface StatsSummary {
  totalArtists: number;
  verifiedMasters: number;
  totalArtworks: number;
  totalValuation: number;
  averageValuation: number;
  archivedArtworks: number;
  exhibitedArtworks: number;
  totalExhibitions: number;
  totalCurators: number;
  totalSales: number;
  salesRevenue: number;
}

export interface SqlExecuteResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  truncated: boolean;
  executionTimeMs: number;
}

export interface RawQueryHistory {
  id: number;
  sql: string;
  executionTimeMs: number;
  rowsReturned: number;
  status: string;
  executedBy: string;
  executedAt: string;
}

// ---------------------------------------------------------------------------
// Endpoint wrappers
// ---------------------------------------------------------------------------

export const api = {
  health: () => request<HealthInfo>('/api/health'),

  auth: {
    login: (email: string, password: string) =>
      request<DbUser>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => request<DbUser>('/api/auth/me'),
    logout: () =>
      request<{ message: string }>('/api/auth/logout', { method: 'POST' }),
  },

  artists: {
    list: () => request<ArtistResponsePayload[]>('/api/artists'),
    create: (payload: ArtistPayload) =>
      request<ArtistResponsePayload>('/api/artists', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: ArtistPayload) =>
      request<ArtistResponsePayload>(`/api/artists/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    remove: (id: string) =>
      request<void>(`/api/artists/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }),
  },

  artworks: {
    list: () => request<ArtworkPayload[]>('/api/artworks'),
  },

  stats: () => request<StatsSummary>('/api/stats'),
  queryHistory: () => request<RawQueryHistory[]>('/api/query-history'),
  schema: () => request<SchemaTablePayload[]>('/api/schema'),

  executeSql: (sql: string) =>
    request<SqlExecuteResult>('/api/sql/execute', {
      method: 'POST',
      body: JSON.stringify({ sql }),
    }),

  admin: {
    resetSeed: () =>
      request<{ message: string; artists: number; artworks: number }>(
        '/api/admin/reset-seed',
        { method: 'POST' }
      ),
    analyze: () =>
      request<{ message: string; elapsedMs: number }>(
        '/api/admin/maintenance/analyze',
        { method: 'POST' }
      ),
  },
};

// ---------------------------------------------------------------------------
// Payload shapes returned by the backend for artists / artworks / schema
// ---------------------------------------------------------------------------

export interface ArtworkPayload {
  id: number;
  code: string;
  title: string;
  artistId: string;
  artistName: string;
  medium: string;
  dimensions: string;
  price: number;
  yearCreated: number;
  status: string;
  imageUrl: string;
}

export interface SchemaColumnPayload {
  name: string;
  dataType: string;
  isPk: boolean;
  isFk: boolean;
  nullable: boolean;
}

export interface SchemaTablePayload {
  name: string;
  rowsCount: number;
  columnsCount: number;
  description: string;
  columns: SchemaColumnPayload[];
}

/** "2m ago" style relative timestamp used by the query history panel. */
export function relativeTime(isoTimestamp: string): string {
  const then = new Date(isoTimestamp.replace(' ', 'T')).getTime();
  if (Number.isNaN(then)) return isoTimestamp;
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
