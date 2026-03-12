package com.anhpt.urlshortener.redirect.domain.event;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Getter
@NoArgsConstructor
public class ClickEvent {

    private String shortCode;
    private Instant timestamp;
    private String ipAddress;
    private String userAgent;

    @JsonCreator
    public ClickEvent(@JsonProperty("shortCode") String shortCode,
                      @JsonProperty("ipAddress") String ipAddress,
                      @JsonProperty("userAgent") String userAgent) {
        this.shortCode = shortCode;
        this.timestamp = Instant.now();
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
    }
}
