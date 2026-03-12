package com.anhpt.urlshortener.link.application.usecase;

import com.anhpt.urlshortener.link.domain.model.LinkStatus;
import com.anhpt.urlshortener.link.domain.model.ShortLink;
import com.anhpt.urlshortener.link.domain.repository.ShortLinkRepository;
import com.anhpt.urlshortener.shared.exception.ErrorCode;
import com.anhpt.urlshortener.shared.exception.ForbiddenException;
import com.anhpt.urlshortener.shared.exception.ResourceNotFoundException;
import com.anhpt.urlshortener.shared.security.SecurityUtils;
import org.springframework.stereotype.Service;

@Service
public class DeleteShortLinkUseCase {

    private final ShortLinkRepository repository;

    public DeleteShortLinkUseCase(ShortLinkRepository repository) {
        this.repository = repository;
    }

    public void execute(Long linkId) {
        Long userId = SecurityUtils.getCurrentUserId();

        ShortLink link = repository.findById(linkId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.LINK_NOT_FOUND));

        if (!link.getOwnerId().equals(userId)) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN);
        }

        link.setStatus(LinkStatus.DELETED);
        repository.save(link);
    }
}
