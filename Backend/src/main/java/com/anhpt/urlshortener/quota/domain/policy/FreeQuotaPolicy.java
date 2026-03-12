package com.anhpt.urlshortener.quota.domain.policy;

/**
 * Free plan quota limits.
 */
public class FreeQuotaPolicy implements QuotaPolicy {

    @Override
    public int maxLinksPerUser() {
        return 100;
    }

    @Override
    public int maxClicksPerMonth() {
        return 10_000;
    }
}
