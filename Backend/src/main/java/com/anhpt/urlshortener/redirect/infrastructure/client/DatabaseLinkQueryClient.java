package com.anhpt.urlshortener.redirect.infrastructure.client;

import com.anhpt.urlshortener.link.domain.model.LinkStatus;
import com.anhpt.urlshortener.link.domain.model.ShortLink;
import com.anhpt.urlshortener.link.domain.repository.ShortLinkRepository;
import com.anhpt.urlshortener.redirect.domain.service.LinkQueryClient;
import org.springframework.stereotype.Component;

import java.util.Optional;


@Component
public class DatabaseLinkQueryClient implements LinkQueryClient {

    private final ShortLinkRepository shortLinkRepository;

    public DatabaseLinkQueryClient(ShortLinkRepository shortLinkRepository) {
        this.shortLinkRepository = shortLinkRepository;
    }

    @Override
    public Optional<String> getOriginalUrlByShortCode(String shortCode) {
        return shortLinkRepository.findByShortCode(shortCode)
                .filter(link -> link.getStatus() == LinkStatus.ACTIVE)
                .filter(link -> !link.isExpired())
                .map(ShortLink::getOriginalUrl);
    }
}
