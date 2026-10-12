package com.artgallery.controller;

import com.artgallery.dto.SqlExecuteRequest;
import com.artgallery.dto.SqlExecuteResponse;
import com.artgallery.service.SqlConsoleService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Validated read-only SQL console. ADMIN role only. Arbitrarily destructive
 * SQL is never accepted — see SqlConsoleService for the enforced rules.
 */
@RestController
@RequestMapping("/api/sql")
public class SqlConsoleController {

    private final SqlConsoleService sqlConsoleService;

    public SqlConsoleController(SqlConsoleService sqlConsoleService) {
        this.sqlConsoleService = sqlConsoleService;
    }

    @PostMapping("/execute")
    @PreAuthorize("hasRole('ADMIN')")
    public SqlExecuteResponse execute(@Valid @RequestBody SqlExecuteRequest request) {
        return sqlConsoleService.execute(request);
    }
}
