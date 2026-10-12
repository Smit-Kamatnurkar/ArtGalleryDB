package com.artgallery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ExhibitionRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 150)
        String title,

        @NotNull(message = "Curator ID is required")
        Long curatorId,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "End date is required")
        LocalDate endDate,

        @Size(max = 80)
        String galleryWing) {}
