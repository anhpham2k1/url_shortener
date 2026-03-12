package com.anhpt.urlshortener.shared.security;

public interface AuthenticatedUserProvider {
    CurrentUser getCurrentUser();
    Long getCurrentUserId();
}