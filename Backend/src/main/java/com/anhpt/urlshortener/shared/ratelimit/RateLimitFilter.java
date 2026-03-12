package com.anhpt.urlshortener.shared.ratelimit;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;

/**
 * Rate limiting filter applied before controller processing.
 *
 * Routing logic:
 *   /r/**           → REDIRECT plan, key = IP
 *   /api/v1/auth/** → AUTH plan, key = IP
 *   POST /api/v1/links → LINK_CREATION plan, key = userId
 *   /api/v1/**      → API plan, key = userId or IP
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;
    private final ObjectMapper objectMapper;

    public RateLimitFilter(RateLimitService rateLimitService, ObjectMapper objectMapper) {
        this.rateLimitService = rateLimitService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Skip static resources and Swagger
        if (isExcluded(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        RateLimitPlan plan = resolvePlan(path, method);
        String key = resolveKey(request, plan);

        if (!rateLimitService.tryConsume(key, plan)) {
            writeRateLimitResponse(response, request);
            return;
        }

        // Add rate limit headers
        long remaining = rateLimitService.getAvailableTokens(key, plan);
        response.setHeader("X-Rate-Limit-Remaining", String.valueOf(remaining));
        response.setHeader("X-Rate-Limit-Limit", String.valueOf(plan.getCapacity()));

        filterChain.doFilter(request, response);
    }

    private RateLimitPlan resolvePlan(String path, String method) {
        if (path.startsWith("/r/")) {
            return RateLimitPlan.REDIRECT;
        }
        if (path.startsWith("/api/v1/auth")) {
            return RateLimitPlan.AUTH;
        }
        if (path.equals("/api/v1/links") && "POST".equalsIgnoreCase(method)) {
            return RateLimitPlan.LINK_CREATION;
        }
        return RateLimitPlan.API;
    }

    private String resolveKey(HttpServletRequest request, RateLimitPlan plan) {
        String prefix = plan.name() + ":";

        // For auth and redirect: key by IP
        if (plan == RateLimitPlan.AUTH || plan == RateLimitPlan.REDIRECT) {
            return prefix + extractIp(request);
        }

        // For authenticated endpoints: key by userId, fallback to IP
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return prefix + auth.getPrincipal().toString();
        }

        return prefix + extractIp(request);
    }

    private String extractIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private boolean isExcluded(String path) {
        return path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs")
                || path.equals("/favicon.ico");
    }

    private void writeRateLimitResponse(HttpServletResponse response,
                                         HttpServletRequest request) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> body = Map.of(
                "timestamp", Instant.now().toString(),
                "status", 429,
                "error", "TOO_MANY_REQUESTS",
                "message", "Rate limit exceeded. Please try again later.",
                "path", request.getRequestURI()
        );

        objectMapper.writeValue(response.getWriter(), body);
    }
}
