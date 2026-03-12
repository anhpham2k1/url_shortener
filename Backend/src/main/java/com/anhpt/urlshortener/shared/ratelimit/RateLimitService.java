package com.anhpt.urlshortener.shared.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limit service using Bucket4j Token Bucket algorithm.
 *
 * Each key (IP or userId) gets its own bucket.
 * Buckets are created lazily and cached in a ConcurrentHashMap.
 *
 * For multi-instance deployment, replace with Redis-backed ProxyManager.
 */
@Service
public class RateLimitService {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    /**
     * Try to consume 1 token from the bucket for the given key and plan.
     *
     * @return true if request is allowed, false if rate limit exceeded
     */
    public boolean tryConsume(String key, RateLimitPlan plan) {
        Bucket bucket = buckets.computeIfAbsent(key, k -> createBucket(plan));
        return bucket.tryConsume(1);
    }

    /**
     * Get remaining tokens for a key.
     */
    public long getAvailableTokens(String key, RateLimitPlan plan) {
        Bucket bucket = buckets.computeIfAbsent(key, k -> createBucket(plan));
        return bucket.getAvailableTokens();
    }

    private Bucket createBucket(RateLimitPlan plan) {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(
                        plan.getCapacity(),
                        Refill.greedy(plan.getRefillTokens(), plan.getRefillDuration())
                ))
                .build();
    }
}
