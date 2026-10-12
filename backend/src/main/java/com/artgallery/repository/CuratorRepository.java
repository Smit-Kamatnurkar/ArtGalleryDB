package com.artgallery.repository;

import com.artgallery.dto.CuratorRequest;
import com.artgallery.dto.CuratorResponse;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class CuratorRepository {

    private final JdbcTemplate jdbc;

    public CuratorRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final String BASE_SELECT = """
        SELECT id, full_name, department, email, security_clearance, created_at
        FROM curators
        """;

    public List<CuratorResponse> findAll() {
        return jdbc.query(BASE_SELECT + " ORDER BY id ASC", (rs, i) -> mapRow(rs));
    }

    public Optional<CuratorResponse> findById(long id) {
        try {
            return Optional.ofNullable(jdbc.queryForObject(
                    BASE_SELECT + " WHERE id = ?", (rs, i) -> mapRow(rs), id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public boolean existsById(long id) {
        Boolean exists = jdbc.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM curators WHERE id = ?)", Boolean.class, id);
        return Boolean.TRUE.equals(exists);
    }

    public boolean existsByEmail(String email) {
        Boolean exists = jdbc.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM curators WHERE email = ?)", Boolean.class, email);
        return Boolean.TRUE.equals(exists);
    }

    public long insert(CuratorRequest req) {
        KeyHolder keys = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO curators (full_name, department, email, security_clearance) VALUES (?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, req.fullName());
            ps.setString(2, req.department());
            ps.setString(3, req.email());
            ps.setString(4, req.securityClearance() == null ? "STANDARD" : req.securityClearance());
            return ps;
        }, keys);
        Number key = keys.getKeys() == null ? null : (Number) keys.getKeys().get("id");
        return key == null ? -1 : key.longValue();
    }

    public void update(long id, CuratorRequest req) {
        jdbc.update("""
                UPDATE curators SET full_name = ?, department = ?, email = ?, security_clearance = ?
                WHERE id = ?
                """,
                req.fullName(), req.department(), req.email(),
                req.securityClearance() == null ? "STANDARD" : req.securityClearance(), id);
    }

    public void deleteById(long id) {
        jdbc.update("DELETE FROM curators WHERE id = ?", id);
    }

    private CuratorResponse mapRow(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new CuratorResponse(
                rs.getLong("id"),
                rs.getString("full_name"),
                rs.getString("department"),
                rs.getString("email"),
                rs.getString("security_clearance"),
                rs.getTimestamp("created_at") == null ? null : rs.getTimestamp("created_at").toLocalDateTime());
    }
}
