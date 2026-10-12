package com.artgallery;

import com.artgallery.exception.BadRequestException;
import com.artgallery.service.SqlConsoleService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

/** Unit tests for the SQL console read-only validation rules. */
@SpringBootTest
class SqlConsoleValidationTest {

    @Autowired
    private SqlConsoleService sqlConsoleService;

    @Test
    void acceptsSimpleSelect() {
        assertDoesNotThrow(() -> sqlConsoleService.validateReadOnly(
                "SELECT title, price FROM artworks WHERE price > 100;"));
    }

    @Test
    void acceptsCteQuery() {
        assertDoesNotThrow(() -> sqlConsoleService.validateReadOnly(
                "WITH rich AS (SELECT * FROM artworks WHERE price > 500000) SELECT * FROM rich"));
    }

    @Test
    void rejectsInsertStatement() {
        assertThrows(BadRequestException.class, () ->
                sqlConsoleService.validateReadOnly("INSERT INTO artists VALUES ('ART-9999', 'x')"));
    }

    @Test
    void rejectsDropStatement() {
        assertThrows(BadRequestException.class, () ->
                sqlConsoleService.validateReadOnly("DROP TABLE artworks"));
    }

    @Test
    void rejectsUpdateStatement() {
        assertThrows(BadRequestException.class, () ->
                sqlConsoleService.validateReadOnly("UPDATE artworks SET price = 0"));
    }

    @Test
    void rejectsMultipleStatements() {
        assertThrows(BadRequestException.class, () ->
                sqlConsoleService.validateReadOnly("SELECT 1; SELECT 2"));
    }

    @Test
    void rejectsNonSelectKeyword() {
        assertThrows(BadRequestException.class, () ->
                sqlConsoleService.validateReadOnly("EXPLAIN SELECT * FROM artworks"));
    }

    @Test
    void rejectsEmptyStatement() {
        assertThrows(BadRequestException.class, () ->
                sqlConsoleService.validateReadOnly("   "));
    }
}
