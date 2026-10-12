-- ============================================================================
-- ArtGalleryDB — Representative SQL Queries
-- Database : artgallery_db
--
-- These statements are the same operations the Java backend executes through
-- JDBC (Spring JdbcTemplate) for the application's features. They are also
-- runnable manually with psql for verification during evaluation:
--
--   psql -h localhost -U artgallery_user -d artgallery_db -f database/queries.sql
-- ============================================================================

-- ---------------------------------------------------------------------------
-- SECTION 1 — SELECT with JOINs (Artists & Artworks screens)
-- ---------------------------------------------------------------------------

-- 1.1 List all artists with the number of artworks they own
--     (used by GET /api/artists)
SELECT
    a.id, a.name, a.country, a.country_code, a.active_period, a.bio,
    a.movement, a.image_url, a.verified_master,
    COUNT(w.id) AS artworks_count,
    (SELECT w2.title FROM artworks w2 WHERE w2.artist_id = a.id
      ORDER BY w2.price DESC LIMIT 1) AS sample_piece_title
FROM artists a
LEFT JOIN artworks w ON w.artist_id = a.id
GROUP BY a.id
ORDER BY a.name;

-- 1.2 Artwork catalog joined with artist details (view-based)
--     (used by GET /api/artworks)
SELECT w.code, w.title, w.artist_id, aw.artist_name, w.medium,
       w.dimensions, w.price, w.year_created, w.status, w.image_url
FROM artwork_with_artist aw
JOIN artworks w ON w.id = aw.id
ORDER BY w.created_at DESC;

-- 1.3 High-value exhibited artworks (JOIN + WHERE + ORDER BY)
SELECT w.title, a.name AS artist_name, w.price, w.status
FROM artworks w
INNER JOIN artists a ON w.artist_id = a.id
WHERE w.price >= 350000 AND w.status = 'Exhibited'
ORDER BY w.price DESC;

-- ---------------------------------------------------------------------------
-- SECTION 2 — Aggregates, GROUP BY, HAVING (Dashboard statistics)
-- ---------------------------------------------------------------------------

-- 2.1 Dashboard totals (used by GET /api/stats)
SELECT
    (SELECT COUNT(*) FROM artists)                          AS total_artists,
    (SELECT COUNT(*) FROM artists WHERE verified_master)    AS verified_masters,
    (SELECT COUNT(*) FROM artworks)                         AS total_artworks,
    (SELECT COALESCE(SUM(price), 0) FROM artworks)          AS total_valuation,
    (SELECT COALESCE(ROUND(AVG(price), 2), 0) FROM artworks) AS avg_valuation,
    (SELECT COUNT(*) FROM artworks WHERE status = 'Archived') AS archived_artworks,
    (SELECT COUNT(*) FROM artworks WHERE status = 'Exhibited') AS exhibited_artworks,
    (SELECT COUNT(*) FROM exhibitions)                      AS total_exhibitions,
    (SELECT COUNT(*) FROM curators)                         AS total_curators;

-- 2.2 Artwork count and average valuation per country (GROUP BY + HAVING)
SELECT
    a.country,
    COUNT(w.id)      AS total_works,
    ROUND(AVG(w.price), 2) AS average_valuation
FROM artists a
LEFT JOIN artworks w ON a.id = w.artist_id
GROUP BY a.country
HAVING COUNT(w.id) > 0
ORDER BY total_works DESC;

-- 2.3 Artists owning the most catalogued artworks (subquery + MAX)
SELECT a.name, COUNT(w.id) AS artwork_count
FROM artists a
JOIN artworks w ON w.artist_id = a.id
GROUP BY a.name
HAVING COUNT(w.id) = (
    SELECT MAX(cnt) FROM (
        SELECT COUNT(*) AS cnt FROM artworks GROUP BY artist_id
    ) AS counts
);

-- 2.4 Sales revenue and commission per status (aggregate over JOIN)
SELECT s.status,
       COUNT(*)               AS transactions,
       SUM(s.sale_price)      AS gross_revenue,
       SUM(s.sale_price * s.commission_rate) AS commission
FROM sales s
GROUP BY s.status;

-- ---------------------------------------------------------------------------
-- SECTION 3 — INSERT (Create operations via POST endpoints)
-- ---------------------------------------------------------------------------

-- 3.1 Register a new artist (POST /api/artists)
INSERT INTO artists (id, name, country, country_code, active_period, bio)
VALUES ('ART-0090', 'Claude Monet', 'France', 'FRA', '1840 – 1926',
        'Founder of French Impressionist painting');

-- 3.2 Catalog a new artwork with a foreign key reference (POST /api/artworks)
INSERT INTO artworks (code, title, artist_id, medium, dimensions, price, year_created, status)
VALUES ('ART-2025-001', 'Water Lilies Study', 'ART-0090', 'Oil on canvas',
        '65 × 81 cm', 1250000.00, 1906, 'Vaulted');

-- ---------------------------------------------------------------------------
-- SECTION 4 — UPDATE (Edit operations via PUT endpoints)
-- ---------------------------------------------------------------------------

-- 4.1 Edit an artist record (PUT /api/artists/{id})
UPDATE artists
SET name = 'Claude Oscar Monet', active_period = '1840 – 1926 (Impressionism)'
WHERE id = 'ART-0090';

-- 4.2 Re-value an artwork after appraisal (PUT /api/artworks/{id})
UPDATE artworks
SET price = 1350000.00, last_appraisal_date = CURRENT_DATE
WHERE code = 'ART-2025-001';

-- 4.3 Mark an artwork as sold and record the sale in ONE transaction.
--     The backend performs both statements inside a single JDBC transaction;
--     if either fails, both are rolled back (atomicity demo).
BEGIN;
INSERT INTO sales (artwork_id, buyer_name, sale_price, status)
SELECT id, 'Demo Buyer', price, 'Completed' FROM artworks WHERE code = 'ART-2025-001';
UPDATE artworks SET status = 'Acquired' WHERE code = 'ART-2025-001';
COMMIT;

-- ---------------------------------------------------------------------------
-- SECTION 5 — DELETE (referential integrity demonstrations)
-- ---------------------------------------------------------------------------

-- 5.1 Delete an artwork (DELETE /api/artworks/{id})
DELETE FROM artworks WHERE code = 'ART-2025-001';

-- 5.2 Deleting an artist that still owns artworks is RESTRICTED by the FK:
--     DELETE FROM artists WHERE id = 'ART-0090';
--     -> ERROR: update or insert on table "artists" violates foreign key
--        constraint "fk_artworks_artist" (the backend surfaces this as 409).
--     After removing the artist's artworks first, the delete succeeds:
DELETE FROM artworks WHERE artist_id = 'ART-0090';
DELETE FROM artists  WHERE id = 'ART-0090';

-- ---------------------------------------------------------------------------
-- SECTION 6 — DDL demonstrations (run from schema.sql)
-- ---------------------------------------------------------------------------
-- CREATE TABLE / ADD COLUMN / CREATE INDEX examples used by the project:

-- ALTER TABLE artworks ADD COLUMN condition_grade VARCHAR(10);
-- ALTER TABLE artworks DROP COLUMN condition_grade;
-- CREATE INDEX idx_artists_country ON artists(country);

-- ---------------------------------------------------------------------------
-- SECTION 7 — Cleanup demo rows created by this script
-- ---------------------------------------------------------------------------
-- (rows ART-0090 / ART-2025-001 were already removed in Section 5)
