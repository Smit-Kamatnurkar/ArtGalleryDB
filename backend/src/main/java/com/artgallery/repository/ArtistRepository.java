package com.artgallery.repository;

import com.artgallery.dto.ArtistRequest;
import com.artgallery.dto.ArtistResponse;
import com.artgallery.exception.NotFoundException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class ArtistRepository {

    private final JdbcTemplate jdbc;

    public ArtistRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final String BASE_SELECT = """
        SELECT a.id, a.name, a.country, a.country_code, a.active_period, a.bio,
               a.movement, a.image_url,
               COUNT(w.id) AS artworks_count,
               (SELECT w2.title FROM artworks w2 WHERE w2.artist_id = a.id
                 ORDER BY w2.price DESC NULLS LAST LIMIT 1) AS sample_piece_title
        FROM artists a
        LEFT JOIN artworks w ON w.artist_id = a.id
        """;

    public List<ArtistResponse> findAll(String search) {
        StringBuilder sql = new StringBuilder(BASE_SELECT);
        List<Object> params = new ArrayList<>();
        if (search != null && !search.isBlank()) {
            sql.append(" WHERE a.name ILIKE ? OR a.country ILIKE ? OR a.id ILIKE ? OR COALESCE(a.bio, '') ILIKE ?");
            String like = "%" + search.trim() + "%";
            params.add(like);
            params.add(like);
            params.add(like);
            params.add(like);
        }
        sql.append(" GROUP BY a.id ORDER BY a.created_at DESC, a.name");
        return jdbc.query(sql.toString(), (rs, i) -> mapRow(rs), params.toArray());
    }

    public Optional<ArtistResponse> findById(String id) {
        String sql = BASE_SELECT + " WHERE a.id = ? GROUP BY a.id";
        try {
            return Optional.ofNullable(jdbc.queryForObject(sql, (rs, i) -> mapRow(rs), id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public boolean existsById(String id) {
        Boolean exists = jdbc.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM artists WHERE id = ?)", Boolean.class, id);
        return Boolean.TRUE.equals(exists);
    }

    public String nextArtistId() {
        String max = jdbc.queryForObject(
                "SELECT COALESCE(MAX(SUBSTRING(id FROM 5)::int), 80) FROM artists", String.class);
        return String.format("ART-%04d", Integer.parseInt(max) + 1);
    }

    public void insert(String id, ArtistRequest req) {
        jdbc.update("""
                INSERT INTO artists (id, name, country, country_code, active_period, bio, movement, image_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                id, req.name(), req.country(), req.countryCode(), req.activePeriod(),
                req.bio(), req.movement(), req.imageUrl());
    }

    public void update(String id, ArtistRequest req) {
        jdbc.update("""
                UPDATE artists SET name = ?, country = ?, country_code = ?, active_period = ?,
                       bio = ?, movement = ?, image_url = ?
                WHERE id = ?
                """,
                req.name(), req.country(), req.countryCode(), req.activePeriod(),
                req.bio(), req.movement(), req.imageUrl(), id);
    }

    public long countArtworksByArtist(String id) {
        Long count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM artworks WHERE artist_id = ?", Long.class, id);
        return count == null ? 0 : count;
    }

    public void deleteById(String id) {
        jdbc.update("DELETE FROM artists WHERE id = ?", id);
    }

    private ArtistResponse mapRow(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new ArtistResponse(
                rs.getString("id"),
                rs.getString("name"),
                rs.getString("country"),
                rs.getString("country_code"),
                rs.getString("active_period"),
                rs.getString("bio"),
                rs.getString("movement"),
                rs.getString("image_url"),
                rs.getLong("artworks_count"),
                rs.getString("sample_piece_title"));
    }
}
