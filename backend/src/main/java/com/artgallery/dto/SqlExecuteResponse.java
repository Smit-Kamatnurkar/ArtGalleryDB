package com.artgallery.dto;

import java.util.List;
import java.util.Map;

/** Result of a validated read-only SQL console execution. */
public record SqlExecuteResponse(
        List<String> columns,
        List<Map<String, Object>> rows,
        int rowCount,
        boolean truncated,
        long executionTimeMs) {}
