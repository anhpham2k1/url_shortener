package com.anhpt.urlshortener.shared.response;

public record PageMeta(
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}
