package com.anhpt.urlshortener.quota.domain.policy;

/**
 * Policy interface for quota rules.
 * Strategy pattern — allows pluggable quota rules per plan.
 */
public interface QuotaPolicy {

    /**
     * Maximum number of links a user can create.
     */
    int maxLinksPerUser();

    /**
     * Maximum number of clicks per month.
     */
    int maxClicksPerMonth();
}
