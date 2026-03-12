package com.anhpt.urlshortener.link.application.usecase;

import com.anhpt.urlshortener.link.application.dto.response.ShortLinkResponse;
import com.anhpt.urlshortener.link.domain.repository.ShortLinkRepository;
import com.anhpt.urlshortener.shared.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GetMyLinksUseCase {

    private final ShortLinkRepository repository;

    @Value("${app.base-url}")
    private String baseUrl;

    public GetMyLinksUseCase(ShortLinkRepository repository) {
        this.repository = repository;
    }

    public List<ShortLinkResponse> execute() {
        Long userId = SecurityUtils.getCurrentUserId();

        return repository.findAllByOwnerId(userId).stream()
                .map(link -> new ShortLinkResponse(
                        link.getId(),
                        link.getShortCode(),
                        baseUrl + "/r/" + link.getShortCode(),
                        link.getOriginalUrl(),
                        link.getTitle(),
                        link.getStatus(),
                        0L,
                        link.getExpiresAt(),
                        link.getCreatedAt()
                ))
                .toList();
    }
}
