package com.artgallery.dto;

import java.math.BigDecimal;

public record ArtistResponse(
        String id,
        String name,
        String country,
        String countryCode,
        String activePeriod,
        String bio,
        String movement,
        String imageUrl,
        long artworksCount,
        String samplePieceTitle) {}
