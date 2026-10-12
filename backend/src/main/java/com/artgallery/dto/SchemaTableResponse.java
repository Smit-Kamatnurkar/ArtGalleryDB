package com.artgallery.dto;

import java.util.List;

public record SchemaTableResponse(
        String name,
        long rowsCount,
        int columnsCount,
        String description,
        List<SchemaColumnResponse> columns) {}
