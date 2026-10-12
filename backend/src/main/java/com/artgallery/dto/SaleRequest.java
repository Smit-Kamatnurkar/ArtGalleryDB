package com.artgallery.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SaleRequest(
        @NotNull(message = "Artwork ID is required")
        Long artworkId,

        @NotBlank(message = "Buyer name is required")
        @Size(max = 120)
        String buyerName,

        @Size(max = 120)
        String buyerEmail,

        @NotNull(message = "Sale price is required")
        @DecimalMin(value = "0.00", message = "Sale price must be non-negative")
        BigDecimal salePrice,

        LocalDate saleDate,

        @DecimalMin(value = "0.0000", message = "Commission rate must be >= 0")
        @DecimalMax(value = "1.0000", message = "Commission rate must be <= 1")
        BigDecimal commissionRate,

        @Pattern(regexp = "Pending|Completed|Cancelled|Refunded", message = "Status must be Pending, Completed, Cancelled, or Refunded")
        String status) {}
