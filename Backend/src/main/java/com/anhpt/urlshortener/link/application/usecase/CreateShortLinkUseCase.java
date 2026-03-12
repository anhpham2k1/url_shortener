package com.anhpt.urlshortener.link.application.usecase;

import com.anhpt.urlshortener.link.application.dto.request.CreateShortLinkRequest;
import com.anhpt.urlshortener.link.application.dto.response.ShortLinkResponse;
import com.anhpt.urlshortener.link.domain.event.LinkCreatedEvent;
import com.anhpt.urlshortener.link.domain.model.LinkStatus;
import com.anhpt.urlshortener.link.domain.model.ShortLink;
import com.anhpt.urlshortener.link.domain.repository.ShortLinkRepository;
import com.anhpt.urlshortener.link.domain.service.ShortCodeGenerator;
import com.anhpt.urlshortener.link.domain.validator.LinkValidator;
import com.anhpt.urlshortener.quota.domain.service.QuotaService;
import com.anhpt.urlshortener.redirect.infrastructure.bloom.BloomFilterService;
import com.anhpt.urlshortener.shared.exception.ConflictException;
import com.anhpt.urlshortener.shared.exception.ErrorCode;
import com.anhpt.urlshortener.shared.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Service
public class CreateShortLinkUseCase {

    private final ShortLinkRepository repository;
    private final ShortCodeGenerator generator;
    private final BloomFilterService bloomFilter;
    private final QuotaService quotaService;
    private final LinkValidator linkValidator;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${app.base-url}")
    private String baseUrl;

    public CreateShortLinkUseCase(ShortLinkRepository repository,
                                  ShortCodeGenerator generator,
                                  BloomFilterService bloomFilter,
                                  QuotaService quotaService,
                                  LinkValidator linkValidator,
                                  ApplicationEventPublisher eventPublisher) {
        this.repository = repository;
        this.generator = generator;
        this.bloomFilter = bloomFilter;
        this.quotaService = quotaService;
        this.linkValidator = linkValidator;
        this.eventPublisher = eventPublisher;
    }

    public ShortLinkResponse execute(CreateShortLinkRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();

        // Check quota before creating link
        quotaService.checkLinkCreationQuota(userId);

        String code = resolveShortCode(request);

        ShortLink link = new ShortLink();
        link.setOwnerId(userId);
        link.setOriginalUrl(request.originalUrl());
        link.setShortCode(code);
        link.setTitle(request.title());
        link.setStatus(LinkStatus.ACTIVE);
        link.setExpiresAt(request.expiresAt());

        // Domain validation
        linkValidator.validateCreate(link);

        ShortLink saved = repository.save(link);

        // Register in bloom filter immediately
        bloomFilter.add(saved.getShortCode());

        // Publish domain event
        eventPublisher.publishEvent(new LinkCreatedEvent(saved.getId(), userId, saved.getShortCode()));

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

    private String resolveShortCode(CreateShortLinkRequest request) {
        if (request.customAlias() != null && !request.customAlias().isBlank()) {
            if (repository.existsByShortCode(request.customAlias())) {
                throw new ConflictException(ErrorCode.ALIAS_ALREADY_EXISTS);
            }
            return request.customAlias();
        }

        String code;
        do {
            code = generator.generate();
        } while (repository.existsByShortCode(code));

        return code;
    }
}
