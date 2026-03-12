package com.anhpt.urlshortener.link.domain.event;

import lombok.Getter;

@Getter
public class LinkCreatedEvent {

    private final Long linkId;
    private final Long userId;
    private final String shortCode;

    public LinkCreatedEvent(Long linkId, Long userId, String shortCode) {
        this.linkId = linkId;
        this.userId = userId;
        this.shortCode = shortCode;
    }
}
