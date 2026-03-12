package com.anhpt.urlshortener.link.domain.validator;

import com.anhpt.urlshortener.link.domain.model.ShortLink;
import org.springframework.stereotype.Component;

@Component
public class LinkValidator {

    public void validateCreate(ShortLink link) {
        if (link.getOriginalUrl() == null || link.getOriginalUrl().isBlank()) {
            throw new IllegalArgumentException("Original URL is required");
        }

        if (!link.getOriginalUrl().startsWith("http")) {
            throw new IllegalArgumentException("Invalid URL format");
        }
    }
}
