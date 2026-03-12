package com.anhpt.urlshortener.redirect.domain.service;

/**
 * Cache abstraction for redirect URLs.
 * Implements Cache-Aside pattern.
 */
public interface RedirectCache {

    /**
     * Get cached original URL for a short code.
     * @return original URL or null if not cached
     */
    String get(String shortCode);

    /**
     * Cache original URL for a short code.
     */
    void put(String shortCode, String originalUrl);

    /**
     * Cache a negative result (short code doesn't exist).
     * Uses shorter TTL to avoid DB spam.
     */
    void putNegative(String shortCode);
}
