package com.artgallery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SqlExecuteRequest(
        @NotBlank(message = "SQL statement is required")
        @Size(max = 10000, message = "SQL statement is too long")
        String sql) {}
