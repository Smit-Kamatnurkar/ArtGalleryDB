package com.artgallery.repository;

import com.artgallery.dto.UserResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbc;

    public UserRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public record UserRow(long id, String email, String passwordHash, String name,
                          String role, boolean isActive) {}

    public Optional<UserRow> findByEmail(String email) {
        return jdbc.query(
                "SELECT id, email, password_hash, name, role, is_active FROM users WHERE email = ?",
                (rs, i) -> new UserRow(rs.getLong("id"), rs.getString("email"),
                        rs.getString("password_hash"), rs.getString("name"),
                        rs.getString("role"), rs.getBoolean("is_active")),
                email.toLowerCase())
                .stream().findFirst();
    }

    public void updateLastLogin(long userId) {
        jdbc.update("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", userId);
    }
}
