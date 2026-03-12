package com.anhpt.urlshortener.analytics.domain.service;

import com.anhpt.urlshortener.analytics.domain.model.LinkAnalytics;

import java.util.List;

public interface AnalyticsService {

    void incrementClick(String shortCode);

    List<LinkAnalytics> getAnalytics(String shortCode);

    long getTotalClicks(String shortCode);
}
