package com.anhpt.urlshortener.link.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

import java.time.Instant;

public record CreateShortLinkRequest(
        @NotBlank @URL String originalUrl,
        @Size(min = 3, max = 50) String customAlias,
        @Size(max = 255) String title,
        Instant expiresAt
) {
}
