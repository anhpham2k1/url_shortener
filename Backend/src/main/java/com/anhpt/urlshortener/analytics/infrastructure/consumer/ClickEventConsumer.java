package com.anhpt.urlshortener.analytics.infrastructure.consumer;

import com.anhpt.urlshortener.analytics.domain.service.AnalyticsService;
import com.anhpt.urlshortener.link.domain.model.ShortLink;
import com.anhpt.urlshortener.link.domain.repository.ShortLinkRepository;
import com.anhpt.urlshortener.quota.domain.service.QuotaService;
import com.anhpt.urlshortener.redirect.domain.event.ClickEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Kafka consumer for click events.
 * Processes events from the redirect module:
 *   1. Increments analytics counter (daily aggregation in DB)
 *   2. Increments quota counter (monthly counter in Redis)
 */
@Slf4j
@Component
public class ClickEventConsumer {

    private final AnalyticsService analyticsService;
    private final QuotaService quotaService;
    private final ShortLinkRepository shortLinkRepository;
    private final ObjectMapper objectMapper;

    public ClickEventConsumer(AnalyticsService analyticsService,
                              QuotaService quotaService,
                              ShortLinkRepository shortLinkRepository,
                              ObjectMapper objectMapper) {
        this.analyticsService = analyticsService;
        this.quotaService = quotaService;
        this.shortLinkRepository = shortLinkRepository;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "link-click", groupId = "analytics-service")
    public void consume(String message) {
        try {
            ClickEvent event = objectMapper.readValue(message, ClickEvent.class);

            // 1. Increment analytics (daily DB aggregation)
            analyticsService.incrementClick(event.getShortCode());

            // 2. Increment quota counter (monthly Redis counter)
            shortLinkRepository.findByShortCode(event.getShortCode())
                    .map(ShortLink::getOwnerId)
                    .ifPresent(quotaService::incrementClickCount);

            log.debug("Processed click event for shortCode={}", event.getShortCode());
        } catch (JsonProcessingException e) {
            log.error("Failed to deserialize click event: {}", message, e);
        }
    }
}
