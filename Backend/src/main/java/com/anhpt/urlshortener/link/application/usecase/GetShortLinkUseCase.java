package com.anhpt.urlshortener.link.application.usecase;

import com.anhpt.urlshortener.link.application.dto.response.ShortLinkResponse;
import com.anhpt.urlshortener.link.domain.model.ShortLink;
import com.anhpt.urlshortener.link.domain.repository.ShortLinkRepository;
import com.anhpt.urlshortener.shared.exception.ErrorCode;
import com.anhpt.urlshortener.shared.exception.ForbiddenException;
import com.anhpt.urlshortener.shared.exception.ResourceNotFoundException;
import com.anhpt.urlshortener.shared.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GetShortLinkUseCase {

    private final ShortLinkRepository repository;

    @Value("${app.base-url}")
    private String baseUrl;

    public GetShortLinkUseCase(ShortLinkRepository repository) {
        this.repository = repository;
    }

    public ShortLinkResponse execute(Long linkId) {
        Long userId = SecurityUtils.getCurrentUserId();

        ShortLink link = repository.findById(linkId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.LINK_NOT_FOUND));

        if (!link.getOwnerId().equals(userId)) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN);
        }

        return new ShortLinkResponse(
                link.getId(),
                link.getShortCode(),
                baseUrl + "/r/" + link.getShortCode(),
                link.getOriginalUrl(),
                link.getTitle(),
                link.getStatus(),
                0L,
                link.getExpiresAt(),
                link.getCreatedAt()
        );
    }
}
