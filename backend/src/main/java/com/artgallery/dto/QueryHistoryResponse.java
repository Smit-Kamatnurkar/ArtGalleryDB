package com.artgallery.dto;

public record QueryHistoryResponse(
        long id,
        String sql,
        int executionTimeMs,
        int rowsReturned,
        String status,
        String executedBy,
        String executedAt) {}
