package com.anhpt.urlshortener.analytics.presentation.controller;

import com.anhpt.urlshortener.analytics.application.dto.AnalyticsResponse;
import com.anhpt.urlshortener.analytics.application.usecase.GetLinkAnalyticsUseCase;
import com.anhpt.urlshortener.shared.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/links")
public class AnalyticsController {

    private final GetLinkAnalyticsUseCase getLinkAnalyticsUseCase;

    public AnalyticsController(GetLinkAnalyticsUseCase getLinkAnalyticsUseCase) {
        this.getLinkAnalyticsUseCase = getLinkAnalyticsUseCase;
    }

    @GetMapping("/{shortCode}/analytics")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAnalytics(
            @PathVariable String shortCode) {
        AnalyticsResponse response = getLinkAnalyticsUseCase.execute(shortCode);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
