package com.artgallery.service;

import com.artgallery.dto.SqlExecuteRequest;
import com.artgallery.dto.SqlExecuteResponse;
import com.artgallery.exception.BadRequestException;
import com.artgallery.repository.StatsRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Executes validated, READ-ONLY SQL statements submitted from the SQL console.
 *
 * Safety rules enforced on the backend (never trust the client):
 *   1. Only a single statement is accepted (no embedded semicolons).
 *   2. The statement must start with SELECT or WITH.
 *   3. Data-changing keywords are rejected outright.
 *   4. Execution runs in a read-only transaction with a 5s statement timeout.
 *   5. At most 500 rows are returned (truncated flag set beyond that).
 *   6. Every execution is recorded in query_history (audit trail).
 */
@Service
public class SqlConsoleService {

    private static final int MAX_ROWS = 500;

    private static final Set<String> FORBIDDEN_KEYWORDS = Set.of(
            "INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE", "GRANT", "REVOKE",
            "TRUNCATE", "COPY", "CALL", "DO", "SET", "RESET", "VACUUM", "ANALYZE",
            "LISTEN", "NOTIFY", "REINDEX", "CLUSTER", "COMMENT", "LOCK", "PREPARE",
            "EXECUTE", "DEALLOCATE", "REFRESH", "IMPORT", "SECURITY", "BEGIN", "COMMIT",
            "ROLLBACK", "SAVEPOINT", "RELEASE", "ABORT", "DISCARD", "LOAD", "MERGE");

    private final JdbcTemplate jdbc;
    private final TransactionTemplate readOnlyTx;
    private final StatsRepository statsRepository;
    private final AuthService authService;

    public SqlConsoleService(JdbcTemplate jdbc,
                             PlatformTransactionManager txManager,
                             StatsRepository statsRepository,
                             AuthService authService) {
        this.jdbc = jdbc;
        this.readOnlyTx = new TransactionTemplate(txManager);
        this.readOnlyTx.setReadOnly(true);
        this.readOnlyTx.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        this.statsRepository = statsRepository;
        this.authService = authService;
    }

    /** Validates that a statement is a single read-only query. Throws 400 otherwise. */
    public void validateReadOnly(String sql) {
        String trimmed = sql.trim();
        if (trimmed.endsWith(";")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1).trim();
        }
        if (trimmed.isEmpty()) {
            throw new BadRequestException("Empty SQL statement");
        }
        if (trimmed.contains(";")) {
            throw new BadRequestException(
                    "Only a single SQL statement may be executed (multiple statements detected)");
        }
        String upper = trimmed.toUpperCase(Locale.ROOT);
        if (!(upper.startsWith("SELECT ") || upper.startsWith("SELECT*")
                || upper.startsWith("SELECT(") || upper.equals("SELECT")
                || upper.startsWith("WITH "))) {
            throw new BadRequestException(
                    "The SQL console only accepts read-only SELECT / WITH statements");
        }
        for (String token : upper.split("[\\s(),;=+\\-*/<>|]+")) {
            if (FORBIDDEN_KEYWORDS.contains(token)) {
                throw new BadRequestException(
                        "The SQL console only accepts read-only queries. Keyword '" + token + "' is not allowed.");
            }
        }
    }

    public SqlExecuteResponse execute(SqlExecuteRequest request) {
        String sql = request.sql().trim();
        validateReadOnly(sql);
        if (sql.endsWith(";")) {
            sql = sql.substring(0, sql.length() - 1).trim();
        }
        String finalSql = sql;
        String executedBy = authService.currentUserEmail();

        long start = System.nanoTime();
        try {
            SqlExecuteResponse response = readOnlyTx.execute(status -> {
                // 5s ceiling so a runaway query cannot hold the pool
                jdbc.execute("SET LOCAL statement_timeout = '5s'");
                long t0 = System.nanoTime();
                List<Map<String, Object>> allRows = jdbc.queryForList(finalSql);
                long elapsedMs = (System.nanoTime() - t0) / 1_000_000;

                boolean truncated = allRows.size() > MAX_ROWS;
                List<Map<String, Object>> limited = truncated
                        ? new ArrayList<>(allRows.subList(0, MAX_ROWS)) : allRows;

                List<String> columns = limited.isEmpty() && !allRows.isEmpty()
                        ? new ArrayList<>() : new ArrayList<>();
                if (!limited.isEmpty()) {
                    columns.addAll(new LinkedHashMap<>(limited.get(0)).keySet());
                }
                return new SqlExecuteResponse(columns, limited, allRows.size(), truncated, elapsedMs);
            });
            long totalMs = (System.nanoTime() - start) / 1_000_000;
            statsRepository.recordQuery(finalSql, (int) response.executionTimeMs(),
                    response.rowCount(), "success", null, executedBy);
            return response;
        } catch (org.springframework.dao.DataAccessException e) {
            long totalMs = (System.nanoTime() - start) / 1_000_000;
            String message = e.getMostSpecificCause() != null
                    ? e.getMostSpecificCause().getMessage() : e.getMessage();
            statsRepository.recordQuery(finalSql, (int) totalMs, 0, "error",
                    message, executedBy);
            throw new BadRequestException("SQL execution failed: " + message);
        }
    }
}
