package com.anhpt.urlshortener.link.application.dto.request;

import jakarta.validation.constraints.Size;

public record UpdateShortLinkRequest(
        @Size(max = 255) String title,
        String status
) {
}
