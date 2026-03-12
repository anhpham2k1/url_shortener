package com.anhpt.urlshortener.user.application.dto.response;

import com.anhpt.urlshortener.user.domain.model.UserPlan;
import com.anhpt.urlshortener.user.domain.model.UserRole;
import com.anhpt.urlshortener.user.domain.model.UserStatus;

public record UserResponse(
        Long id,
        String email,
        String fullName,
        UserRole role,
        UserPlan plan,
        UserStatus status
) {
}
