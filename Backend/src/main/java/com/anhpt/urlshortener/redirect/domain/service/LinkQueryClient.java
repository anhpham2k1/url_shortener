package com.anhpt.urlshortener.redirect.domain.service;

import java.util.Optional;

public interface LinkQueryClient {
    Optional<String> getOriginalUrlByShortCode(String shortCode);
}
