package com.artgallery.service;

import com.artgallery.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * ADMIN-only development utility: re-applies database/schema.sql and
 * database/seed.sql. Mirrors the documented manual reset procedure; it is
 * never executed automatically at application startup.
 */
@Service
public class AdminResetService {

    private final DataSource dataSource;
    private final Path sqlDir;

    public AdminResetService(DataSource dataSource,
                             @Value("${app.sql-dir}") String sqlDir) {
        this.dataSource = dataSource;
        this.sqlDir = Path.of(sqlDir);
    }

    public synchronized void resetAndSeed() {
        Path schema = sqlDir.resolve("schema.sql");
        Path seed = sqlDir.resolve("seed.sql");
        if (!Files.isRegularFile(schema) || !Files.isRegularFile(seed)) {
            throw new BadRequestException(
                    "SQL scripts not found in '" + sqlDir.toAbsolutePath()
                    + "'. Set the SQL_DIR environment variable to the database/ directory.");
        }
        ResourceDatabasePopulator schemaPopulator = new ResourceDatabasePopulator(new FileSystemResource(schema));
        schemaPopulator.setContinueOnError(false);
        schemaPopulator.execute(dataSource);

        ResourceDatabasePopulator seedPopulator = new ResourceDatabasePopulator(new FileSystemResource(seed));
        seedPopulator.setContinueOnError(false);
        seedPopulator.execute(dataSource);
    }
}
