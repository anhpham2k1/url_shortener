package com.anhpt.urlshortener.redirect.infrastructure.bloom;

import com.anhpt.urlshortener.link.infrastructure.persistence.SpringDataShortLinkJpaRepository;
import com.google.common.hash.BloomFilter;
import com.google.common.hash.Funnels;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

/**
 * Bloom filter for cache penetration protection.
 *
 * Prevents attackers from spamming random short codes
 * that would otherwise bypass cache and hit the database.
 *
 * If mightContain() returns false → code DEFINITELY doesn't exist → return 404 immediately.
 * If mightContain() returns true → code MIGHT exist → proceed with cache/DB lookup.
 *
 * False positive rate: ~1% (acceptable trade-off).
 * Rebuilds every 5 minutes from DB to stay in sync.
 */
@Slf4j
@Component
public class BloomFilterService {

    private static final int EXPECTED_INSERTIONS = 1_000_000;
    private static final double FALSE_POSITIVE_RATE = 0.01;

    private final SpringDataShortLinkJpaRepository shortLinkJpaRepository;
    private volatile BloomFilter<CharSequence> bloomFilter;

    public BloomFilterService(SpringDataShortLinkJpaRepository shortLinkJpaRepository) {
        this.shortLinkJpaRepository = shortLinkJpaRepository;
        this.bloomFilter = createEmptyFilter();
    }

    @PostConstruct
    public void init() {
        rebuild();
    }

    /**
     * Check if a short code might exist.
     * False = definitely doesn't exist.
     * True = might exist (proceed with lookup).
     */
    public boolean mightContain(String shortCode) {
        return bloomFilter.mightContain(shortCode);
    }

    /**
     * Add a newly created short code to the bloom filter.
     * Called when a new link is created so it's immediately available.
     */
    public void add(String shortCode) {
        bloomFilter.put(shortCode);
    }

    /**
     * Rebuild bloom filter from database every 5 minutes.
     */
    @Scheduled(fixedRate = 300_000)
    public void rebuild() {
        try {
            BloomFilter<CharSequence> newFilter = createEmptyFilter();

            shortLinkJpaRepository.findAll().forEach(entity ->
                    newFilter.put(entity.getShortCode())
            );

            this.bloomFilter = newFilter;
            log.info("Bloom filter rebuilt successfully");
        } catch (Exception e) {
            log.error("Failed to rebuild bloom filter", e);
        }
    }

    private BloomFilter<CharSequence> createEmptyFilter() {
        return BloomFilter.create(
                Funnels.stringFunnel(StandardCharsets.UTF_8),
                EXPECTED_INSERTIONS,
                FALSE_POSITIVE_RATE
        );
    }
}
