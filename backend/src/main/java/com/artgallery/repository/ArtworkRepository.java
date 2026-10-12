package com.artgallery.repository;

import com.artgallery.dto.ArtworkRequest;
import com.artgallery.dto.ArtworkResponse;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class ArtworkRepository {

    private final JdbcTemplate jdbc;

    public ArtworkRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final String BASE_SELECT = """
        SELECT w.id, w.code, w.title, w.artist_id, a.name AS artist_name, w.medium,
               w.dimensions, w.price, w.year_created, w.status, w.image_url
        FROM artworks w
        JOIN artists a ON a.id = w.artist_id
        """;

    public List<ArtworkResponse> findFiltered(String search, String status, String artistId) {
        StringBuilder sql = new StringBuilder(BASE_SELECT);
        List<Object> params = new ArrayList<>();
        if (search != null && !search.isBlank()) {
            sql.append(" WHERE (w.title ILIKE ? OR a.name ILIKE ? OR w.medium ILIKE ? OR w.code ILIKE ?)");
            String like = "%" + search.trim() + "%";
            params.add(like);
            params.add(like);
            params.add(like);
            params.add(like);
        }
        if (status != null && !status.isBlank()) {
            sql.append(params.isEmpty() ? " WHERE" : " AND").append(" w.status = ?");
            params.add(status);
        }
        if (artistId != null && !artistId.isBlank()) {
            sql.append(params.isEmpty() ? " WHERE" : " AND").append(" w.artist_id = ?");
            params.add(artistId);
        }
        sql.append(" ORDER BY w.created_at DESC, w.id DESC");
        return jdbc.query(sql.toString(), (rs, i) -> mapRow(rs), params.toArray());
    }

    public Optional<ArtworkResponse> findById(long id) {
        String sql = BASE_SELECT + " WHERE w.id = ?";
        try {
            return Optional.ofNullable(jdbc.queryForObject(sql, (rs, i) -> mapRow(rs), id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public boolean existsByCode(String code) {
        Boolean exists = jdbc.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM artworks WHERE code = ?)", Boolean.class, code);
        return Boolean.TRUE.equals(exists);
    }

    public long insert(ArtworkRequest req) {
        KeyHolder keys = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO artworks (code, title, artist_id, medium, dimensions, price, year_created, status, image_url) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, req.code());
            ps.setString(2, req.title());
            ps.setString(3, req.artistId());
            ps.setString(4, req.medium());
            ps.setString(5, req.dimensions());
            ps.setBigDecimal(6, req.price());
            if (req.yearCreated() == null) {
                ps.setNull(7, java.sql.Types.INTEGER);
            } else {
                ps.setInt(7, req.yearCreated());
            }
            ps.setString(8, req.status() == null ? "Vaulted" : req.status());
            ps.setString(9, req.imageUrl());
            return ps;
        }, keys);
        Number key = keys.getKeys() == null ? null : (Number) keys.getKeys().get("id");
        return key == null ? -1 : key.longValue();
    }

    public void update(long id, ArtworkRequest req) {
        jdbc.update("""
                UPDATE artworks SET code = ?, title = ?, artist_id = ?, medium = ?, dimensions = ?,
                       price = ?, year_created = ?, status = ?, image_url = ?
                WHERE id = ?
                """,
                req.code(), req.title(), req.artistId(), req.medium(), req.dimensions(),
                req.price(), req.yearCreated(),
                req.status() == null ? "Vaulted" : req.status(), req.imageUrl(), id);
    }

    public void deleteById(long id) {
        jdbc.update("DELETE FROM artworks WHERE id = ?", id);
    }

    private ArtworkResponse mapRow(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new ArtworkResponse(
                rs.getLong("id"),
                rs.getString("code"),
                rs.getString("title"),
                rs.getString("artist_id"),
                rs.getString("artist_name"),
                rs.getString("medium"),
                rs.getString("dimensions"),
                rs.getBigDecimal("price"),
                rs.getObject("year_created") == null ? null : rs.getInt("year_created"),
                rs.getString("status"),
                rs.getString("image_url"));
    }
}
