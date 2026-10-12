package com.artgallery.dto;

import java.math.BigDecimal;
import java.util.List;

/** Dashboard statistics computed with live SQL aggregates. */
public record StatsResponse(
        long totalArtists,
        long verifiedMasters,
        long totalArtworks,
        BigDecimal totalValuation,
        BigDecimal averageValuation,
        long archivedArtworks,
        long exhibitedArtworks,
        long totalExhibitions,
        long totalCurators,
        long totalSales,
        BigDecimal salesRevenue) {}
