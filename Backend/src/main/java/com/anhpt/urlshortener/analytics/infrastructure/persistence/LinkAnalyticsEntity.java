package com.anhpt.urlshortener.analytics.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "link_analytics",
        uniqueConstraints = @UniqueConstraint(columnNames = {"short_code", "date"}))
@Getter
@Setter
public class LinkAnalyticsEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "short_code", nullable = false, length = 50)
    private String shortCode;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "click_count", nullable = false)
    private Long clickCount = 0L;
}
