package com.anhpt.urlshortener.analytics.infrastructure.persistence;

import com.anhpt.urlshortener.analytics.domain.model.LinkAnalytics;
import com.anhpt.urlshortener.analytics.domain.repository.AnalyticsRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public class AnalyticsRepositoryImpl implements AnalyticsRepository {

    private final SpringDataAnalyticsJpaRepository jpaRepository;

    public AnalyticsRepositoryImpl(SpringDataAnalyticsJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public void incrementClick(String shortCode) {
        jpaRepository.incrementClick(shortCode, LocalDate.now());
    }

    @Override
    public List<LinkAnalytics> findByShortCode(String shortCode) {
        return jpaRepository.findByShortCodeOrderByDateDesc(shortCode).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public long getTotalClicks(String shortCode) {
        return jpaRepository.sumClicksByShortCode(shortCode);
    }

    private LinkAnalytics toDomain(LinkAnalyticsEntity entity) {
        LinkAnalytics analytics = new LinkAnalytics();
        analytics.setId(entity.getId());
        analytics.setShortCode(entity.getShortCode());
        analytics.setDate(entity.getDate());
        analytics.setClickCount(entity.getClickCount());
        return analytics;
    }
}
