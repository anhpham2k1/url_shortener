package com.anhpt.urlshortener.quota.domain.service;

import com.anhpt.urlshortener.link.domain.repository.ShortLinkRepository;
import com.anhpt.urlshortener.quota.domain.policy.QuotaPolicy;
import com.anhpt.urlshortener.quota.domain.policy.QuotaPolicyFactory;
import com.anhpt.urlshortener.shared.exception.ErrorCode;
import com.anhpt.urlshortener.shared.exception.QuotaExceededException;
import com.anhpt.urlshortener.shared.exception.ResourceNotFoundException;
import com.anhpt.urlshortener.user.domain.model.User;
import com.anhpt.urlshortener.user.domain.repository.UserRepository;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Quota service that enforces usage limits based on user plan.
 *
 * Link creation quota: checked via DB count.
 * Click quota: tracked via Redis counters for high performance.
 */
@Service
public class QuotaService {

    private static final String CLICK_COUNTER_PREFIX = "quota:clicks:";
    private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM");

    private final UserRepository userRepository;
    private final ShortLinkRepository shortLinkRepository;
    private final QuotaPolicyFactory policyFactory;
    private final StringRedisTemplate redisTemplate;

    public QuotaService(UserRepository userRepository,
                        ShortLinkRepository shortLinkRepository,
                        QuotaPolicyFactory policyFactory,
                        StringRedisTemplate redisTemplate) {
        this.userRepository = userRepository;
        this.shortLinkRepository = shortLinkRepository;
        this.policyFactory = policyFactory;
        this.redisTemplate = redisTemplate;
    }

    /**
     * Check if user can create more links.
     * Throws QuotaExceededException if limit reached.
     */
    public void checkLinkCreationQuota(Long userId) {
        User user = getUser(userId);
        QuotaPolicy policy = policyFactory.getPolicy(user.getPlan());

        int currentLinks = shortLinkRepository.findAllByOwnerId(userId).size();

        if (currentLinks >= policy.maxLinksPerUser()) {
            throw new QuotaExceededException(ErrorCode.QUOTA_EXCEEDED,
                    "Link creation limit reached: " + policy.maxLinksPerUser());
        }
    }

    /**
     * Increment monthly click counter in Redis.
     * Called by analytics consumer after processing click event.
     */
    public void incrementClickCount(Long userId) {
        String key = buildMonthlyClickKey(userId);
        redisTemplate.opsForValue().increment(key);
        // Set TTL if this is the first increment (key just created)
        if (redisTemplate.getExpire(key) == -1) {
            redisTemplate.expire(key, Duration.ofDays(35));
        }
    }

    /**
     * Check if user has remaining click quota.
     * Uses Redis counter for high-performance reads.
     */
    public void checkClickQuota(Long userId) {
        User user = getUser(userId);
        QuotaPolicy policy = policyFactory.getPolicy(user.getPlan());

        String key = buildMonthlyClickKey(userId);
        String value = redisTemplate.opsForValue().get(key);
        long currentClicks = value != null ? Long.parseLong(value) : 0;

        if (currentClicks >= policy.maxClicksPerMonth()) {
            throw new QuotaExceededException(ErrorCode.QUOTA_EXCEEDED,
                    "Monthly click limit reached: " + policy.maxClicksPerMonth());
        }
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));
    }

    private String buildMonthlyClickKey(Long userId) {
        String month = LocalDate.now().format(MONTH_FORMAT);
        return CLICK_COUNTER_PREFIX + userId + ":" + month;
    }
}
