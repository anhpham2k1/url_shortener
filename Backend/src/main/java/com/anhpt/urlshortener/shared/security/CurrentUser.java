package com.anhpt.urlshortener.shared.security;

public record CurrentUser(
        Long id,
        String email,
        String role
) {
}