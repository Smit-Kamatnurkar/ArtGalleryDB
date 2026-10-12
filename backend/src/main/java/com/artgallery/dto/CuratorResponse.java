package com.artgallery.dto;

import java.time.LocalDateTime;

public record CuratorResponse(
        long id,
        String fullName,
        String department,
        String email,
        String securityClearance,
        LocalDateTime createdAt) {}
