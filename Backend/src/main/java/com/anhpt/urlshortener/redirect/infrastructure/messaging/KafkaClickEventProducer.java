package com.anhpt.urlshortener.redirect.infrastructure.messaging;

import com.anhpt.urlshortener.redirect.domain.event.ClickEvent;
import com.anhpt.urlshortener.redirect.domain.service.ClickEventPublisher;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class KafkaClickEventProducer implements ClickEventPublisher {

    private static final String TOPIC = "link-click";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public KafkaClickEventProducer(KafkaTemplate<String, String> kafkaTemplate,
                                   ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public void publish(String shortCode, String ipAddress, String userAgent) {
        try {
            ClickEvent event = new ClickEvent(shortCode, ipAddress, userAgent);
            String payload = objectMapper.writeValueAsString(event);

            kafkaTemplate.send(TOPIC, shortCode, payload)
                    .whenComplete((result, ex) -> {
                        if (ex != null) {
                            log.error("Failed to publish click event for shortCode={}", shortCode, ex);
                        }
                    });
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize click event for shortCode={}", shortCode, e);
        }
    }
}
