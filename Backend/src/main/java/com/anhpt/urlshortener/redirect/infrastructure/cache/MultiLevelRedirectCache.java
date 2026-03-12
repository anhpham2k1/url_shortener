package com.anhpt.urlshortener.redirect.infrastructure.cache;

import com.anhpt.urlshortener.redirect.domain.service.RedirectCache;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Multi-level cache implementation:
 *   L1 = Caffeine (in-memory, ~0.05ms)
 *   L2 = Redis (network, ~0.5ms)
 *
 * Cache-Aside pattern:
 *   1. Check L1 → hit → return
 *   2. Check L2 → hit → populate L1 → return
 *   3. Miss → caller queries DB → calls put() to populate both levels
 */
@Component
public class MultiLevelRedirectCache implements RedirectCache {

    private static final String REDIS_KEY_PREFIX = "redirect:";
    private static final String NULL_MARKER = "NULL";
    private static final Duration REDIS_TTL = Duration.ofHours(24);
    private static final Duration NEGATIVE_REDIS_TTL = Duration.ofMinutes(1);

    private final Cache<String, String> localCache;
    private final StringRedisTemplate redisTemplate;

    public MultiLevelRedirectCache(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.localCache = Caffeine.newBuilder()
                .maximumSize(100_000)
                .expireAfterWrite(Duration.ofMinutes(10))
                .build();
    }

    @Override
    public String get(String shortCode) {
        // L1: Local cache (~0.05ms)
        String localValue = localCache.getIfPresent(shortCode);
        if (localValue != null) {
            return NULL_MARKER.equals(localValue) ? NULL_MARKER : localValue;
        }

        // L2: Redis (~0.5ms)
        String redisValue = redisTemplate.opsForValue().get(REDIS_KEY_PREFIX + shortCode);
        if (redisValue != null) {
            // Promote to L1
            localCache.put(shortCode, redisValue);
            return NULL_MARKER.equals(redisValue) ? NULL_MARKER : redisValue;
        }

        return null;
    }

    @Override
    public void put(String shortCode, String originalUrl) {
        // Write to both levels
        localCache.put(shortCode, originalUrl);
        redisTemplate.opsForValue().set(REDIS_KEY_PREFIX + shortCode, originalUrl, REDIS_TTL);
    }

    @Override
    public void putNegative(String shortCode) {
        // Negative cache with short TTL
        localCache.put(shortCode, NULL_MARKER);
        redisTemplate.opsForValue().set(REDIS_KEY_PREFIX + shortCode, NULL_MARKER, NEGATIVE_REDIS_TTL);
    }
}
