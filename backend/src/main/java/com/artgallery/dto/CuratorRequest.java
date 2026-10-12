package com.artgallery.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CuratorRequest(
        @NotBlank(message = "Full name is required")
        @Size(max = 100)
        String fullName,

        @Size(max = 80)
        String department,

        @NotBlank(message = "Email is required")
        @Email(message = "Must be a valid email address")
        @Size(max = 120)
        String email,

        @Pattern(regexp = "STANDARD|SENIOR|CHIEF", message = "Clearance must be STANDARD, SENIOR, or CHIEF")
        String securityClearance) {}
