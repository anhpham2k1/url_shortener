package com.anhpt.urlshortener.link.application.dto.response;

import com.anhpt.urlshortener.link.domain.model.LinkStatus;

import java.time.Instant;

public record ShortLinkResponse(
        Long id,
        String shortCode,
        String shortUrl,
        String originalUrl,
        String title,
        LinkStatus status,
        long clicks,
        Instant expiresAt,
        Instant createdAt
) {
}
