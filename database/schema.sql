-- ============================================================================
-- ArtGalleryDB — PostgreSQL Schema (DDL)
-- Database : artgallery_db
-- Owner    : artgallery_user
--
-- This script contains all Data Definition Language (DDL) statements used by
-- the application: CREATE TABLE, CREATE INDEX, and CREATE VIEW.
-- Execution order matters because of foreign key dependencies.
--
-- The script is safe to re-run only after reset.sql (it drops nothing).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Extensions
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. USERS — application login accounts (authentication + authorization)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,           -- BCrypt hash, never plaintext
    name          VARCHAR(100) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'USER'
                  CHECK (role IN ('ADMIN', 'USER')),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    last_login    TIMESTAMP    NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_email CHECK (email = LOWER(email))
);

-- ----------------------------------------------------------------------------
-- 2. CURATORS — gallery staff responsible for appraisals and exhibitions
-- ----------------------------------------------------------------------------
CREATE TABLE curators (
    id                 SERIAL PRIMARY KEY,
    full_name          VARCHAR(100) NOT NULL,
    department         VARCHAR(80),
    email              VARCHAR(120) NOT NULL UNIQUE,
    security_clearance VARCHAR(20)  NOT NULL DEFAULT 'STANDARD'
                       CHECK (security_clearance IN ('STANDARD', 'SENIOR', 'CHIEF')),
    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 3. ARTISTS — master registry of accredited artists
--    id is a human-readable business key (e.g. 'ART-0081')
-- ----------------------------------------------------------------------------
CREATE TABLE artists (
    id              VARCHAR(16) PRIMARY KEY
                    CHECK (id ~ '^ART-[0-9]{4,}$'),
    name            VARCHAR(120) NOT NULL,
    country         VARCHAR(60),
    country_code    CHAR(3),
    active_period   VARCHAR(60),
    bio             TEXT,
    movement        VARCHAR(100),
    image_url       VARCHAR(512),
    verified_master BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 4. ARTWORKS — catalog of gallery-managed pieces (FK -> ARTISTS, CURATORS)
-- ----------------------------------------------------------------------------
CREATE TABLE artworks (
    id                  SERIAL PRIMARY KEY,
    code                VARCHAR(24)  NOT NULL UNIQUE,          -- e.g. 'ART-2024-089'
    title               VARCHAR(200) NOT NULL,
    artist_id           VARCHAR(16)  NOT NULL,
    medium              VARCHAR(100),
    dimensions          VARCHAR(60),
    price               NUMERIC(12,2) NOT NULL DEFAULT 0
                        CHECK (price >= 0),                    -- monetary value
    year_created        INTEGER
                        CHECK (year_created IS NULL OR (year_created >= 1 AND year_created <= 2100)),
    status              VARCHAR(20)  NOT NULL DEFAULT 'Vaulted'
                        CHECK (status IN ('Archived','Vaulted','In Transit','Exhibited','Acquired')),
    image_url           VARCHAR(512),
    curator_id          INTEGER,
    vault_location      VARCHAR(60),
    created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_appraisal_date DATE,
    CONSTRAINT fk_artworks_artist  FOREIGN KEY (artist_id)  REFERENCES artists(id)  ON DELETE RESTRICT,
    CONSTRAINT fk_artworks_curator FOREIGN KEY (curator_id) REFERENCES curators(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------------------
-- 5. EXHIBITIONS — scheduled shows, each managed by one curator
-- ----------------------------------------------------------------------------
CREATE TABLE exhibitions (
    id           SERIAL PRIMARY KEY,
    title        VARCHAR(150) NOT NULL,
    curator_id   INTEGER      NOT NULL,
    start_date   DATE         NOT NULL,
    end_date     DATE         NOT NULL,
    gallery_wing VARCHAR(80),
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_exhibitions_dates CHECK (end_date >= start_date),
    CONSTRAINT fk_exhibitions_curator FOREIGN KEY (curator_id)
        REFERENCES curators(id) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- 6. SALES — recorded transactions of artworks sold to buyers
--    An artwork can only be sold once (UNIQUE on artwork_id).
-- ----------------------------------------------------------------------------
CREATE TABLE sales (
    id              SERIAL PRIMARY KEY,
    artwork_id      INTEGER      NOT NULL UNIQUE,
    buyer_name      VARCHAR(120) NOT NULL,
    buyer_email     VARCHAR(120),
    sale_price      NUMERIC(12,2) NOT NULL
                    CHECK (sale_price >= 0),
    sale_date       DATE         NOT NULL DEFAULT CURRENT_DATE,
    commission_rate NUMERIC(5,4) NOT NULL DEFAULT 0.15
                    CHECK (commission_rate >= 0 AND commission_rate <= 1),
    status          VARCHAR(20)  NOT NULL DEFAULT 'Pending'
                    CHECK (status IN ('Pending','Completed','Cancelled','Refunded')),
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sales_artwork FOREIGN KEY (artwork_id)
        REFERENCES artworks(id) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- 7. QUERY_HISTORY — audit trail of SQL statements executed through the
--    application's SQL console (drives the "Recent Executed Queries" panel)
-- ----------------------------------------------------------------------------
CREATE TABLE query_history (
    id                SERIAL PRIMARY KEY,
    sql_text          TEXT        NOT NULL,
    execution_time_ms INTEGER     NOT NULL,
    rows_returned     INTEGER     NOT NULL DEFAULT 0,
    status            VARCHAR(10) NOT NULL DEFAULT 'success'
                      CHECK (status IN ('success','error')),
    error_message     TEXT,
    executed_by       VARCHAR(120),
    executed_at       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 8. Indexes for frequently queried columns
-- ----------------------------------------------------------------------------
CREATE INDEX idx_artworks_artist      ON artworks(artist_id);
CREATE INDEX idx_artworks_status      ON artworks(status);
CREATE INDEX idx_artworks_price       ON artworks(price);
CREATE INDEX idx_artworks_title       ON artworks(title);
CREATE INDEX idx_artworks_curator     ON artworks(curator_id);
CREATE INDEX idx_exhibitions_curator  ON exhibitions(curator_id);
CREATE INDEX idx_sales_artwork        ON sales(artwork_id);
CREATE INDEX idx_query_history_time   ON query_history(executed_at DESC);

-- ----------------------------------------------------------------------------
-- 9. View: artworks joined with artist attributes (used by list endpoints)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW artwork_with_artist AS
SELECT
    w.id,
    w.code,
    w.title,
    w.artist_id,
    a.name            AS artist_name,
    a.country         AS artist_country,
    w.medium,
    w.dimensions,
    w.price,
    w.year_created,
    w.status,
    w.image_url,
    w.curator_id,
    w.vault_location,
    w.created_at,
    w.last_appraisal_date
FROM artworks w
JOIN artists a ON w.artist_id = a.id;

-- ----------------------------------------------------------------------------
-- 10. Trigger: keep users.email lowercase (enforces chk_users_email)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION lower_email() RETURNS trigger AS $$
BEGIN
    NEW.email := LOWER(NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_lower_email
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION lower_email();
