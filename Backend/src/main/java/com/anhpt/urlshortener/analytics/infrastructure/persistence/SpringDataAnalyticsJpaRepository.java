package com.anhpt.urlshortener.analytics.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

public interface SpringDataAnalyticsJpaRepository extends JpaRepository<LinkAnalyticsEntity, Long> {

    List<LinkAnalyticsEntity> findByShortCodeOrderByDateDesc(String shortCode);

    @Query("SELECT COALESCE(SUM(a.clickCount), 0) FROM LinkAnalyticsEntity a WHERE a.shortCode = :shortCode")
    long sumClicksByShortCode(@Param("shortCode") String shortCode);

    /**
     * Atomic upsert: increment click count or insert new record.
     * Uses native PostgreSQL ON CONFLICT for atomicity under high concurrency.
     */
    @Modifying
    @Transactional
    @Query(value = """
            INSERT INTO link_analytics (short_code, date, click_count)
            VALUES (:shortCode, :date, 1)
            ON CONFLICT (short_code, date)
            DO UPDATE SET click_count = link_analytics.click_count + 1
            """, nativeQuery = true)
    void incrementClick(@Param("shortCode") String shortCode, @Param("date") LocalDate date);
}
