package com.anhpt.urlshortener.auth.application.dto.response;

import com.anhpt.urlshortener.user.application.dto.response.UserResponse;

public record AuthResponse(
        String accessToken,
        UserResponse user
) {
}
