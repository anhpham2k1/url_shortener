package com.anhpt.urlshortener.redirect.domain.service;

/**
 * Port for publishing click events asynchronously.
 */
public interface ClickEventPublisher {
    void publish(String shortCode, String ipAddress, String userAgent);
}
