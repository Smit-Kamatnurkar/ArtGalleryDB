-- ============================================================================
-- ArtGalleryDB — Development Reset Script
-- Database : artgallery_db
--
-- WARNING: DESTRUCTIVE. Drops all tables, views, and functions, then reloads
-- the schema and seed data. NEVER run against a production database.
--
-- This script is NOT executed automatically by the application at startup.
-- It can be run manually from a terminal, or through the in-app
-- "Reset Database Seed Records" action (Settings screen, ADMIN role only),
-- which executes database/schema.sql + database/seed.sql on the server.
--
-- Usage (from the ArtGalleryDB/ root):
--   psql -h localhost -U artgallery_user -d artgallery_db -f database/reset.sql
--   psql -h localhost -U artgallery_user -d artgallery_db -f database/schema.sql
--   psql -h localhost -U artgallery_user -d artgallery_db -f database/seed.sql
-- ============================================================================

DROP VIEW  IF EXISTS artwork_with_artist;
DROP TABLE IF EXISTS query_history CASCADE;
DROP TABLE IF EXISTS sales          CASCADE;
DROP TABLE IF EXISTS exhibitions    CASCADE;
DROP TABLE IF EXISTS artworks       CASCADE;
DROP TABLE IF EXISTS artists        CASCADE;
DROP TABLE IF EXISTS curators       CASCADE;
DROP TABLE IF EXISTS users          CASCADE;
DROP FUNCTION IF EXISTS lower_email();
