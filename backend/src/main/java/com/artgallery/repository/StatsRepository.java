package com.artgallery.repository;

import com.artgallery.dto.QueryHistoryResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public class StatsRepository {

    private final JdbcTemplate jdbc;

    public StatsRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public long countArtists() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM artists", Long.class);
    }

    public long countVerifiedMasters() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM artists WHERE verified_master", Long.class);
    }

    public long countArtworks() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM artworks", Long.class);
    }

    public long countArtworksByStatus(String status) {
        return jdbc.queryForObject(
                "SELECT COUNT(*) FROM artworks WHERE status = ?", Long.class, status);
    }

    public BigDecimal sumValuation() {
        return jdbc.queryForObject(
                "SELECT COALESCE(SUM(price), 0) FROM artworks", BigDecimal.class);
    }

    public BigDecimal avgValuation() {
        return jdbc.queryForObject(
                "SELECT COALESCE(ROUND(AVG(price), 2), 0) FROM artworks", BigDecimal.class);
    }

    public long countExhibitions() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM exhibitions", Long.class);
    }

    public long countCurators() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM curators", Long.class);
    }

    public long countSales() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM sales", Long.class);
    }

    public BigDecimal salesRevenue() {
        return jdbc.queryForObject(
                "SELECT COALESCE(SUM(sale_price), 0) FROM sales WHERE status IN ('Completed','Pending')",
                BigDecimal.class);
    }

    public List<QueryHistoryResponse> recentQueries(int limit) {
        return jdbc.query("""
                SELECT id, sql_text, execution_time_ms, rows_returned, status,
                       executed_by, executed_at
                FROM query_history
                ORDER BY executed_at DESC, id DESC
                LIMIT ?
                """,
                (rs, i) -> new QueryHistoryResponse(
                        rs.getLong("id"),
                        rs.getString("sql_text"),
                        rs.getInt("execution_time_ms"),
                        rs.getInt("rows_returned"),
                        rs.getString("status"),
                        rs.getString("executed_by"),
                        rs.getString("executed_at") == null ? null : rs.getString("executed_at")),
                limit);
    }

    public void recordQuery(String sql, int executionTimeMs, int rowsReturned,
                            String status, String errorMessage, String executedBy) {
        jdbc.update("""
                INSERT INTO query_history (sql_text, execution_time_ms, rows_returned, status, error_message, executed_by)
                VALUES (?, ?, ?, ?, ?, ?)
                """, sql, executionTimeMs, rowsReturned, status, errorMessage, executedBy);
    }
}
