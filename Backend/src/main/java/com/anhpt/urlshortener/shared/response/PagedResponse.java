package com.anhpt.urlshortener.shared.response;

import java.util.List;

public record PagedResponse<T>(
        List<T> content,
        PageMeta meta
) {
}