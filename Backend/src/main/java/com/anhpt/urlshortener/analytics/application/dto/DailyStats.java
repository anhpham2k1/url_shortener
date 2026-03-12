package com.anhpt.urlshortener.analytics.application.dto;

import java.time.LocalDate;

public record DailyStats(
        LocalDate date,
        long clicks
) {
}
