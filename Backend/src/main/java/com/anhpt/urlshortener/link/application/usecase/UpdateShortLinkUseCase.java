package com.anhpt.urlshortener.link.application.usecase;

import com.anhpt.urlshortener.link.application.dto.request.UpdateShortLinkRequest;
import com.anhpt.urlshortener.link.application.dto.response.ShortLinkResponse;
import com.anhpt.urlshortener.link.domain.model.LinkStatus;
import com.anhpt.urlshortener.link.domain.model.ShortLink;
import com.anhpt.urlshortener.link.domain.repository.ShortLinkRepository;
import com.anhpt.urlshortener.shared.exception.ErrorCode;
import com.anhpt.urlshortener.shared.exception.ForbiddenException;
import com.anhpt.urlshortener.shared.exception.ResourceNotFoundException;
import com.anhpt.urlshortener.shared.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class UpdateShortLinkUseCase {

    private final ShortLinkRepository repository;

    @Value("${app.base-url}")
    private String baseUrl;

    public UpdateShortLinkUseCase(ShortLinkRepository repository) {
        this.repository = repository;
    }

    public ShortLinkResponse execute(Long linkId, UpdateShortLinkRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();

        ShortLink link = repository.findById(linkId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.LINK_NOT_FOUND));

        if (!link.getOwnerId().equals(userId)) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN);
        }

        if (request.title() != null) {
            link.setTitle(request.title());
        }

        if (request.status() != null) {
            link.setStatus(LinkStatus.valueOf(request.status()));
        }

        ShortLink saved = repository.save(link);

        return new ShortLinkResponse(
                saved.getId(),
                saved.getShortCode(),
                baseUrl + "/r/" + saved.getShortCode(),
                saved.getOriginalUrl(),
                saved.getTitle(),
                saved.getStatus(),
                0L,
                saved.getExpiresAt(),
                saved.getCreatedAt()
        );
    }
}
