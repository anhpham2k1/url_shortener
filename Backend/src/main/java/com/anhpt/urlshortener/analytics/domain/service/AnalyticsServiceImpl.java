package com.anhpt.urlshortener.analytics.domain.service;

import com.anhpt.urlshortener.analytics.domain.model.LinkAnalytics;
import com.anhpt.urlshortener.analytics.domain.repository.AnalyticsRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final AnalyticsRepository analyticsRepository;

    public AnalyticsServiceImpl(AnalyticsRepository analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }

    @Override
    public void incrementClick(String shortCode) {
        analyticsRepository.incrementClick(shortCode);
    }

    @Override
    public List<LinkAnalytics> getAnalytics(String shortCode) {
        return analyticsRepository.findByShortCode(shortCode);
    }

    @Override
    public long getTotalClicks(String shortCode) {
        return analyticsRepository.getTotalClicks(shortCode);
    }
}
