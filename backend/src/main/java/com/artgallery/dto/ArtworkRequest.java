package com.artgallery.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

/** Request body for creating or updating an artwork. */
public record ArtworkRequest(
        @NotBlank(message = "Code is required")
        @Size(max = 24) String code,

        @NotBlank(message = "Title is required")
        @Size(max = 200) String title,

        @NotBlank(message = "Artist id is required")
        String artistId,

        @Size(max = 100) String medium,
        @Size(max = 60) String dimensions,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.00", message = "Price must be zero or positive")
        BigDecimal price,

        @Min(value = 1, message = "Year must be a positive year")
        @Max(value = 2100, message = "Year must be 2100 or earlier")
        Integer yearCreated,

        @Pattern(regexp = "Archived|Vaulted|In Transit|Exhibited|Acquired",
                 message = "Status must be one of: Archived, Vaulted, In Transit, Exhibited, Acquired")
        String status,

        @Size(max = 512) String imageUrl) {}
