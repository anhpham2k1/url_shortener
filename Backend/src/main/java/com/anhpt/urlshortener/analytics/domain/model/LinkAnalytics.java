package com.anhpt.urlshortener.analytics.domain.model;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class LinkAnalytics {

    private Long id;
    private String shortCode;
    private LocalDate date;
    private Long clickCount;
}
