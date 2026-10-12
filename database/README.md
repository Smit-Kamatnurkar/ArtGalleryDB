# ArtGalleryDB — Database (PostgreSQL)

This directory contains all SQL scripts for the ArtGalleryDB application.

## Database details

| Item     | Value             |
|----------|-------------------|
| Engine   | PostgreSQL 16     |
| Name     | `artgallery_db`   |
| User     | `artgallery_user` |
| Port     | `5432`            |

## Files

| File         | Purpose                                                            |
|--------------|--------------------------------------------------------------------|
| `schema.sql` | DDL: tables, constraints, indexes, view, trigger (run first)       |
| `seed.sql`   | DML: sample data and the two development application accounts      |
| `reset.sql`  | Destructive drop of all objects — use only to reset development DB |
| `queries.sql`| Representative SELECT / INSERT / UPDATE / DELETE / JOIN / aggregates used by the app |

## Setup

```bash
# 1. Start PostgreSQL (macOS, Homebrew)
brew services start postgresql@16

# 2. Create the application role and database (once)
psql -d postgres -c "CREATE USER artgallery_user WITH PASSWORD 'artgallery_pass';"
psql -d postgres -c "CREATE DATABASE artgallery_db OWNER artgallery_user;"

# 3. Create the schema (execution order matters)
psql -h localhost -U artgallery_user -d artgallery_db -f database/schema.sql
psql -h localhost -U artgallery_user -d artgallery_db -f database/seed.sql
```

Enter the password `artgallery_pass` when prompted (or set `PGPASSWORD`).

## Reset (development only — destructive)

```bash
psql -h localhost -U artgallery_user -d artgallery_db -f database/reset.sql
psql -h localhost -U artgallery_user -d artgallery_db -f database/schema.sql
psql -h localhost -U artgallery_user -d artgallery_db -f database/seed.sql
```

The backend also exposes an ADMIN-only `POST /api/admin/reset-seed` endpoint used
by the Settings screen ("Reset Database Seed Records") which executes
`schema.sql` + `seed.sql` on the server. It is never run automatically at startup.

## Verification queries

```sql
\dt                                        -- list tables
SELECT COUNT(*) FROM artists;              -- 13
SELECT COUNT(*) FROM artworks;             -- 16
SELECT email, role FROM users;             -- 2 application accounts
SELECT name, COUNT(*) FROM artworks w JOIN artists a ON a.id=w.artist_id GROUP BY name;
```

## Schema overview

- **users** — login accounts, BCrypt `password_hash`, `role` (`ADMIN`/`USER`).
- **curators** — staff members managing appraisals and exhibitions.
- **artists** — business-key `id` (`ART-XXXX`), provenance metadata.
- **artworks** — FK `artist_id → artists` (ON DELETE RESTRICT), FK `curator_id → curators` (ON DELETE SET NULL), `status` CHECK constraint, `price NUMERIC(12,2)`.
- **exhibitions** — FK `curator_id → curators` (ON DELETE RESTRICT), date CHECK.
- **sales** — FK `artwork_id → artworks` (UNIQUE: an artwork can be sold once).
- **query_history** — audit of SQL executed through the in-app SQL console.

All monetary values use `NUMERIC(12,2)`. Cross-table integrity is enforced by
foreign keys; frequently filtered columns (`artworks.status`, `price`,
`title`, `artist_id`) are indexed.
