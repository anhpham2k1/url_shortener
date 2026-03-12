package com.anhpt.urlshortener.analytics.application.dto;

import java.util.List;

public record AnalyticsResponse(
        String shortCode,
        long totalClicks,
        List<DailyStats> dailyStats
) {
}
