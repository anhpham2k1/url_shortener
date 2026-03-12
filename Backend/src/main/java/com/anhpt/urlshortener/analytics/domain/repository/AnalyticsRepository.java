package com.anhpt.urlshortener.analytics.domain.repository;

import com.anhpt.urlshortener.analytics.domain.model.LinkAnalytics;

import java.util.List;

public interface AnalyticsRepository {

    void incrementClick(String shortCode);

    List<LinkAnalytics> findByShortCode(String shortCode);

    long getTotalClicks(String shortCode);
}
