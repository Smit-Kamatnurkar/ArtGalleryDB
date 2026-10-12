package com.artgallery.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ExhibitionResponse(
        long id,
        String title,
        long curatorId,
        String curatorName,
        LocalDate startDate,
        LocalDate endDate,
        String galleryWing,
        LocalDateTime createdAt) {}
