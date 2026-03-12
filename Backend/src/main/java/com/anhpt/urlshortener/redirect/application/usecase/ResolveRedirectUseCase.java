package com.anhpt.urlshortener.redirect.application.usecase;

import com.anhpt.urlshortener.redirect.domain.service.ClickEventPublisher;
import com.anhpt.urlshortener.redirect.domain.service.LinkQueryClient;
import com.anhpt.urlshortener.redirect.domain.service.RedirectCache;
import com.anhpt.urlshortener.redirect.domain.service.RedirectDomainService;
import com.anhpt.urlshortener.redirect.infrastructure.bloom.BloomFilterService;
import com.anhpt.urlshortener.shared.exception.ErrorCode;
import com.anhpt.urlshortener.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * High-performance redirect resolution use case.
 *
 * Flow:
 *   1. Bloom filter check → false → 404 immediately (~0ms, no cache/DB hit)
 *   2. L1 local cache → hit → return (~0.05ms)
 *   3. L2 Redis cache → hit → promote to L1 → return (~0.5ms)
 *   4. Database lookup → found → populate L1+L2 → return (~5-10ms)
 *   5. Database lookup → not found → negative cache → 404
 *   6. Publish ClickEvent to Kafka (async, non-blocking)
 */
@Service
public class ResolveRedirectUseCase implements RedirectDomainService {

    private static final String NULL_MARKER = "NULL";

    private final BloomFilterService bloomFilter;
    private final RedirectCache cache;
    private final LinkQueryClient linkQueryClient;
    private final ClickEventPublisher clickEventPublisher;

    public ResolveRedirectUseCase(BloomFilterService bloomFilter,
                                  RedirectCache cache,
                                  LinkQueryClient linkQueryClient,
                                  ClickEventPublisher clickEventPublisher) {
        this.bloomFilter = bloomFilter;
        this.cache = cache;
        this.linkQueryClient = linkQueryClient;
        this.clickEventPublisher = clickEventPublisher;
    }

    @Override
    public String resolve(String shortCode, String ipAddress, String userAgent) {
        // Step 1: Bloom filter — fast reject non-existent codes
        if (!bloomFilter.mightContain(shortCode)) {
            throw new ResourceNotFoundException(ErrorCode.LINK_NOT_FOUND);
        }

        // Step 2 & 3: Multi-level cache lookup (L1 local → L2 Redis)
        String cachedUrl = cache.get(shortCode);
        if (cachedUrl != null) {
            if (NULL_MARKER.equals(cachedUrl)) {
                throw new ResourceNotFoundException(ErrorCode.LINK_NOT_FOUND);
            }
            clickEventPublisher.publish(shortCode, ipAddress, userAgent);
            return cachedUrl;
        }

        // Step 4: Database lookup
        Optional<String> originalUrl = linkQueryClient.getOriginalUrlByShortCode(shortCode);

        if (originalUrl.isEmpty()) {
            // Step 5: Negative cache — prevent repeated DB queries
            cache.putNegative(shortCode);
            throw new ResourceNotFoundException(ErrorCode.LINK_NOT_FOUND);
        }

        // Step 6: Populate both cache levels
        String url = originalUrl.get();
        cache.put(shortCode, url);

        // Step 7: Async event publishing
        clickEventPublisher.publish(shortCode, ipAddress, userAgent);

        return url;
    }
}
