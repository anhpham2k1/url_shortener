package com.anhpt.urlshortener.shared.security;

import com.anhpt.urlshortener.shared.exception.ErrorCode;
import com.anhpt.urlshortener.shared.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static CurrentUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof CurrentUser currentUser)) {
            throw new UnauthorizedException(ErrorCode.UNAUTHORIZED);
        }

        return currentUser;
    }

    public static Long getCurrentUserId() {
        return getCurrentUser().id();
    }
}