export interface Artist {
  id: string; // e.g. "ART-0081"
  name: string;
  country: string;
  countryCode: string;
  activePeriod: string;
  bio: string;
  artworksCount: number;
  samplePieceTitle?: string;
  imageUrl?: string;
  movement?: string;
}

export interface Artwork {
  id: number;
  code: string; // e.g. "ART-2024-089"
  title: string;
  artistId: string;
  artistName: string;
  medium: string;
  dimensions?: string;
  price: number;
  yearCreated: number;
  status: 'Archived' | 'Vaulted' | 'In Transit' | 'Exhibited' | 'Acquired';
  imageUrl: string;
  galleryId?: number;
}

/** One row of the query_history audit table (SQL console executions). */
export interface QueryHistoryItem {
  id: number | string;
  statusCode: string; // "200 OK" | "400 ERR"
  timestamp: string; // relative, e.g. "2m ago"
  sql: string;
  executionTime: string; // e.g. "3.4ms"
  rowsReturned: number;
  executedBy?: string;
  bufferGets?: number;
}

export interface SchemaColumn {
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
  nullable?: boolean;
  fkTarget?: string;
}

export interface SchemaTable {
  name: string;
  rowsCount: number;
  columnsCount: number;
  columns: SchemaColumn[];
  description: string;
}
