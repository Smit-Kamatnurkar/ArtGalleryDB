package com.artgallery.dto;

public record SchemaColumnResponse(
        String name,
        String dataType,
        boolean isPk,
        boolean isFk,
        boolean nullable) {}
