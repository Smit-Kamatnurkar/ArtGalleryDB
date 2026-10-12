package com.artgallery.repository;

import com.artgallery.dto.SchemaColumnResponse;
import com.artgallery.dto.SchemaTableResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Reads live table/column/row-count metadata from PostgreSQL catalogs. */
@Repository
public class SchemaRepository {

    private final JdbcTemplate jdbc;
    private final DataSource dataSource;

    private static final Map<String, String> DESCRIPTIONS = Map.of(
            "users", "Application login accounts with BCrypt password hashes and roles.",
            "curators", "Authorized department conservators, ledger admins, and acquisition signatories.",
            "artists", "Master curatorial registry of accredited artists, provenance, and nationality codes.",
            "artworks", "Relational catalog of institution-managed pieces, valuations, and storage vaults.",
            "exhibitions", "Scheduled institutional galleries, retrospectives, and touring loans.",
            "sales", "Recorded artwork sale transactions with commission rates.",
            "query_history", "Audit trail of SQL statements executed through the SQL console.");

    public SchemaRepository(JdbcTemplate jdbc, DataSource dataSource) {
        this.jdbc = jdbc;
        this.dataSource = dataSource;
    }

    public List<SchemaTableResponse> getSchema() {
        Map<String, List<SchemaColumnResponse>> tables = new LinkedHashMap<>();
        try (Connection conn = dataSource.getConnection()) {
            try (ResultSet rs = conn.getMetaData().getColumns(null, "public", null, null)) {
                while (rs.next()) {
                    String table = rs.getString("TABLE_NAME");
                    SchemaColumnResponse col = new SchemaColumnResponse(
                            rs.getString("COLUMN_NAME"),
                            rs.getString("TYPE_NAME"),
                            false, false,
                            "YES".equalsIgnoreCase(rs.getString("IS_NULLABLE")));
                    tables.computeIfAbsent(table, k -> new ArrayList<>()).add(col);
                }
            }
            // primary keys
            try (ResultSet rs = conn.getMetaData().getPrimaryKeys(null, "public", null)) {
                while (rs.next()) {
                    markColumn(tables, rs.getString("TABLE_NAME"), rs.getString("COLUMN_NAME"), true, false);
                }
            }
            // foreign keys
            try (ResultSet rs = conn.getMetaData().getImportedKeys(null, "public", null)) {
                while (rs.next()) {
                    markColumn(tables, rs.getString("FKTABLE_NAME"), rs.getString("FKCOLUMN_NAME"), false, true);
                }
            }
        } catch (SQLException e) {
            throw new IllegalStateException("Failed to read schema metadata", e);
        }

        List<SchemaTableResponse> result = new ArrayList<>();
        for (Map.Entry<String, List<SchemaColumnResponse>> entry : tables.entrySet()) {
            String name = entry.getKey();
            Long rows = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM \"" + name + "\"", Long.class); // table names come from catalog metadata
            result.add(new SchemaTableResponse(
                    name.toUpperCase(),
                    rows == null ? 0 : rows,
                    entry.getValue().size(),
                    DESCRIPTIONS.getOrDefault(name, "Application table."),
                    entry.getValue()));
        }
        result.sort((a, b) -> order(a.name()) - order(b.name()));
        return result;
    }

    private static int order(String name) {
        return switch (name) {
            case "USERS" -> 0;
            case "CURATORS" -> 1;
            case "ARTISTS" -> 2;
            case "ARTWORKS" -> 3;
            case "EXHIBITIONS" -> 4;
            case "SALES" -> 5;
            case "QUERY_HISTORY" -> 6;
            default -> 100;
        };
    }

    private void markColumn(Map<String, List<SchemaColumnResponse>> tables,
                            String table, String column, boolean pk, boolean fk) {
        List<SchemaColumnResponse> cols = tables.get(table);
        if (cols == null) return;
        for (int i = 0; i < cols.size(); i++) {
            SchemaColumnResponse c = cols.get(i);
            if (c.name().equalsIgnoreCase(column)) {
                cols.set(i, new SchemaColumnResponse(c.name(), c.dataType(),
                        c.isPk() || pk, c.isFk() || fk, c.nullable()));
            }
        }
    }
}
