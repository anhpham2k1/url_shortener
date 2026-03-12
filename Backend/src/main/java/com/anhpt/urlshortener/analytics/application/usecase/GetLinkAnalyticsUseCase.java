package com.anhpt.urlshortener.analytics.application.usecase;

import com.anhpt.urlshortener.analytics.application.dto.AnalyticsResponse;
import com.anhpt.urlshortener.analytics.application.dto.DailyStats;
import com.anhpt.urlshortener.analytics.domain.service.AnalyticsService;
import com.anhpt.urlshortener.link.domain.model.ShortLink;
import com.anhpt.urlshortener.link.domain.repository.ShortLinkRepository;
import com.anhpt.urlshortener.shared.exception.ErrorCode;
import com.anhpt.urlshortener.shared.exception.ForbiddenException;
import com.anhpt.urlshortener.shared.exception.ResourceNotFoundException;
import com.anhpt.urlshortener.shared.security.SecurityUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GetLinkAnalyticsUseCase {

    private final AnalyticsService analyticsService;
    private final ShortLinkRepository shortLinkRepository;

    public GetLinkAnalyticsUseCase(AnalyticsService analyticsService,
                                   ShortLinkRepository shortLinkRepository) {
        this.analyticsService = analyticsService;
        this.shortLinkRepository = shortLinkRepository;
    }

    public AnalyticsResponse execute(String shortCode) {
        Long userId = SecurityUtils.getCurrentUserId();

        // Ownership check — only link owner can view analytics
        ShortLink link = shortLinkRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.LINK_NOT_FOUND));

        if (!link.getOwnerId().equals(userId)) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN);
        }

        long totalClicks = analyticsService.getTotalClicks(shortCode);

        List<DailyStats> dailyStats = analyticsService.getAnalytics(shortCode).stream()
                .map(a -> new DailyStats(a.getDate(), a.getClickCount()))
                .toList();

        return new AnalyticsResponse(shortCode, totalClicks, dailyStats);
    }
}
