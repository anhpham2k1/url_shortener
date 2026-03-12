package com.anhpt.urlshortener.quota.domain.policy;

/**
 * Pro plan quota limits.
 */
public class ProQuotaPolicy implements QuotaPolicy {

    @Override
    public int maxLinksPerUser() {
        return 10_000;
    }

    @Override
    public int maxClicksPerMonth() {
        return 1_000_000;
    }
}
