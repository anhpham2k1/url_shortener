package com.anhpt.urlshortener.quota.domain.policy;

import com.anhpt.urlshortener.user.domain.model.UserPlan;
import org.springframework.stereotype.Component;

/**
 * Factory that returns the correct QuotaPolicy based on user plan.
 */
@Component
public class QuotaPolicyFactory {

    public QuotaPolicy getPolicy(UserPlan plan) {
        return switch (plan) {
            case PRO -> new ProQuotaPolicy();
            default -> new FreeQuotaPolicy();
        };
    }
}
