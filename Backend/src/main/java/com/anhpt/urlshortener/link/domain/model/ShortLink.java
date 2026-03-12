package com.anhpt.urlshortener.link.domain.model;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class ShortLink {

    private Long id;
    private Long ownerId;
    private String originalUrl;
    private String shortCode;
    private String title;
    private LinkStatus status;
    private Instant expiresAt;
    private Instant createdAt;
    private Instant updatedAt;

    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(Instant.now());
    }

    public boolean isActive() {
        return status == LinkStatus.ACTIVE && !isExpired();
    }
}
