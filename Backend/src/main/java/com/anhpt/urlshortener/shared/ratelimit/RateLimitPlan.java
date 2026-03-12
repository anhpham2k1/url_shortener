package com.anhpt.urlshortener.shared.ratelimit;

import java.time.Duration;

/**
 * Rate limit plans for different endpoint categories.
 */
public enum RateLimitPlan {

    /** Public redirect: 100 req/sec per IP */
    REDIRECT(100, 100, Duration.ofSeconds(1)),

    /** Auth endpoints (login/register): 5 req/min per IP */
    AUTH(5, 5, Duration.ofMinutes(1)),

    /** Link creation: 10 req/min per user */
    LINK_CREATION(10, 10, Duration.ofMinutes(1)),

    /** General API: 60 req/min per user */
    API(60, 60, Duration.ofMinutes(1));

    private final long capacity;
    private final long refillTokens;
    private final Duration refillDuration;

    RateLimitPlan(long capacity, long refillTokens, Duration refillDuration) {
        this.capacity = capacity;
        this.refillTokens = refillTokens;
        this.refillDuration = refillDuration;
    }

    public long getCapacity() {
        return capacity;
    }

    public long getRefillTokens() {
        return refillTokens;
    }

    public Duration getRefillDuration() {
        return refillDuration;
    }
}
