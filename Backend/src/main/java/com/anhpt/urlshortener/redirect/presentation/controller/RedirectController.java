package com.anhpt.urlshortener.redirect.presentation.controller;

import com.anhpt.urlshortener.redirect.domain.service.RedirectDomainService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
public class RedirectController {

    private final RedirectDomainService redirectDomainService;

    public RedirectController(RedirectDomainService redirectDomainService) {
        this.redirectDomainService = redirectDomainService;
    }

    @GetMapping("/r/{shortCode}")
    public ResponseEntity<Void> redirect(@PathVariable String shortCode,
                                         HttpServletRequest request) {

        String ipAddress = extractIpAddress(request);
        String userAgent = request.getHeader(HttpHeaders.USER_AGENT);

        String originalUrl = redirectDomainService.resolve(shortCode, ipAddress, userAgent);

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(originalUrl))
                .build();
    }

    private String extractIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
