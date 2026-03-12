package com.anhpt.urlshortener.redirect.domain.service;

/**
 * Domain service that encapsulates the core redirect resolution logic.
 * Coordinates multi-level cache, bloom filter, DB lookup, and event publishing.
 *
 * Resolution order:
 *   1. Bloom filter → false → 404 (definitely not found)
 *   2. L1 local cache → hit → return
 *   3. L2 Redis cache → hit → promote to L1 → return
 *   4. Database → found → populate L1 + L2 → return
 *   5. Database → not found → negative cache → 404
 */
public interface RedirectDomainService {

    /**
     * Resolve a short code to its original URL.
     *
     * @param shortCode  the short code to resolve
     * @param ipAddress  client IP for analytics
     * @param userAgent  client user agent for analytics
     * @return the original URL to redirect to
     * @throws com.anhpt.urlshortener.shared.exception.ResourceNotFoundException if not found
     */
    String resolve(String shortCode, String ipAddress, String userAgent);
}
