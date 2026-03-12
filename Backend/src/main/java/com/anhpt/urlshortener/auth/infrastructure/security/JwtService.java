package com.anhpt.urlshortener.auth.infrastructure.security;

import com.anhpt.urlshortener.user.domain.model.User;

public interface JwtService {
    String generateAccessToken(User user);
    Long extractUserId(String token);
    String extractEmail(String token);
    String extractRole(String token);
    boolean isValid(String token);
}
