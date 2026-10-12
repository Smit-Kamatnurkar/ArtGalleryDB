package com.artgallery.controller;

import com.artgallery.repository.StatsRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.util.LinkedHashMap;
import java.util.Map;

/** Health-check endpoint used to diagnose backend and database availability. */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final JdbcTemplate jdbc;
    private final DataSource dataSource;

    @Value("${spring.datasource.url:unknown}")
    private String jdbcUrl;

    public HealthController(JdbcTemplate jdbc, DataSource dataSource) {
        this.jdbc = jdbc;
        this.dataSource = dataSource;
    }

    @GetMapping
    public Map<String, Object> health() {
        Map<String, Object> status = new LinkedHashMap<>();
        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData meta = conn.getMetaData();
            status.put("status", "UP");
            status.put("database", meta.getDatabaseProductName() + " " + meta.getDatabaseProductVersion());
            status.put("jdbcUrl", jdbcUrl.replaceAll("\\?.*", ""));
            status.put("driver", meta.getDriverName() + " " + meta.getDriverVersion());
            status.put("dbLatencyMs", measureLatency());
            status.put("artists", jdbc.queryForObject("SELECT COUNT(*) FROM artists", Long.class));
            status.put("artworks", jdbc.queryForObject("SELECT COUNT(*) FROM artworks", Long.class));
        } catch (Exception e) {
            status.put("status", "DOWN");
            status.put("error", "Database connection failed: " + e.getClass().getSimpleName());
        }
        return status;
    }

    private long measureLatency() {
        long start = System.nanoTime();
        jdbc.queryForObject("SELECT 1", Integer.class);
        return (System.nanoTime() - start) / 1_000_000;
    }
}
