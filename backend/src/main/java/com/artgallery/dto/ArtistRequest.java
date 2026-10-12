package com.artgallery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Request body for creating or updating an artist. */
public record ArtistRequest(
        @Size(max = 16, message = "Artist id must be at most 16 characters")
        @Pattern(regexp = "^$|^ART-[0-9]{4,}$", message = "Artist id must match ART-XXXX")
        String id,

        @NotBlank(message = "Artist name is required (NOT NULL constraint)")
        @Size(max = 120, message = "Name must be at most 120 chars")
        String name,

        @Size(max = 60) String country,
        @Size(max = 3) String countryCode,
        @Size(max = 60) String activePeriod,
        @Size(max = 2000) String bio,
        @Size(max = 100) String movement,
        @Size(max = 512) String imageUrl) {}
