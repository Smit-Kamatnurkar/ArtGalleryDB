package com.artgallery.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record SaleResponse(
        long id,
        long artworkId,
        String artworkTitle,
        String artworkCode,
        String buyerName,
        String buyerEmail,
        BigDecimal salePrice,
        LocalDate saleDate,
        BigDecimal commissionRate,
        String status,
        LocalDateTime createdAt) {}
