package com.artgallery.controller;

import com.artgallery.service.AdminResetService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/** ADMIN-only maintenance operations. */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminResetService adminResetService;
    private final JdbcTemplate jdbc;

    public AdminController(AdminResetService adminResetService, JdbcTemplate jdbc) {
        this.adminResetService = adminResetService;
        this.jdbc = jdbc;
    }

    /**
     * Re-applies database/schema.sql + database/seed.sql (documented reset
     * procedure executed server-side). Not exposed to ordinary users.
     */
    @PostMapping("/reset-seed")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> resetSeed() {
        adminResetService.resetAndSeed();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("message", "Database schema and seed records were re-applied");
        result.put("artists", jdbc.queryForObject("SELECT COUNT(*) FROM artists", Long.class));
        result.put("artworks", jdbc.queryForObject("SELECT COUNT(*) FROM artworks", Long.class));
        return result;
    }

    /**
     * Runs ANALYZE on the catalog tables (refreshes the query planner
     * statistics) — backs the dashboard "Re-index Catalog" action.
     */
    @PostMapping("/maintenance/analyze")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> analyze() {
        long start = System.nanoTime();
        jdbc.execute("ANALYZE artists");
        jdbc.execute("ANALYZE artworks");
        jdbc.execute("ANALYZE exhibitions");
        jdbc.execute("ANALYZE curators");
        long elapsedMs = (System.nanoTime() - start) / 1_000_000;
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("message", "Catalog statistics re-synchronized (planner ANALYZE)");
        result.put("elapsedMs", elapsedMs);
        return result;
    }
}
