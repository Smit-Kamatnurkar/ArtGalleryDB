package com.artgallery.repository;

import com.artgallery.dto.ExhibitionRequest;
import com.artgallery.dto.ExhibitionResponse;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class ExhibitionRepository {

    private final JdbcTemplate jdbc;

    public ExhibitionRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final String BASE_SELECT = """
        SELECT e.id, e.title, e.curator_id, c.full_name AS curator_name,
               e.start_date, e.end_date, e.gallery_wing, e.created_at
        FROM exhibitions e
        JOIN curators c ON c.id = e.curator_id
        """;

    public List<ExhibitionResponse> findAll() {
        return jdbc.query(BASE_SELECT + " ORDER BY e.start_date ASC", (rs, i) -> mapRow(rs));
    }

    public Optional<ExhibitionResponse> findById(long id) {
        try {
            return Optional.ofNullable(jdbc.queryForObject(
                    BASE_SELECT + " WHERE e.id = ?", (rs, i) -> mapRow(rs), id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public long insert(ExhibitionRequest req) {
        KeyHolder keys = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO exhibitions (title, curator_id, start_date, end_date, gallery_wing) VALUES (?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, req.title());
            ps.setLong(2, req.curatorId());
            ps.setDate(3, Date.valueOf(req.startDate()));
            ps.setDate(4, Date.valueOf(req.endDate()));
            ps.setString(5, req.galleryWing());
            return ps;
        }, keys);
        Number key = keys.getKeys() == null ? null : (Number) keys.getKeys().get("id");
        return key == null ? -1 : key.longValue();
    }

    public void update(long id, ExhibitionRequest req) {
        jdbc.update("""
                UPDATE exhibitions SET title = ?, curator_id = ?, start_date = ?, end_date = ?, gallery_wing = ?
                WHERE id = ?
                """,
                req.title(), req.curatorId(),
                Date.valueOf(req.startDate()), Date.valueOf(req.endDate()), req.galleryWing(), id);
    }

    public void deleteById(long id) {
        jdbc.update("DELETE FROM exhibitions WHERE id = ?", id);
    }

    private ExhibitionResponse mapRow(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new ExhibitionResponse(
                rs.getLong("id"),
                rs.getString("title"),
                rs.getLong("curator_id"),
                rs.getString("curator_name"),
                rs.getDate("start_date").toLocalDate(),
                rs.getDate("end_date").toLocalDate(),
                rs.getString("gallery_wing"),
                rs.getTimestamp("created_at") == null ? null : rs.getTimestamp("created_at").toLocalDateTime());
    }
}
