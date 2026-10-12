package com.artgallery.dto;

import java.math.BigDecimal;

public record ArtworkResponse(
        long id,
        String code,
        String title,
        String artistId,
        String artistName,
        String medium,
        String dimensions,
        BigDecimal price,
        Integer yearCreated,
        String status,
        String imageUrl) {}
