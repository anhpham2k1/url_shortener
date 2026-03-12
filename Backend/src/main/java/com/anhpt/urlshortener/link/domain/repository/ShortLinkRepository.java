package com.anhpt.urlshortener.link.domain.repository;

import com.anhpt.urlshortener.link.domain.model.ShortLink;

import java.util.List;
import java.util.Optional;

public interface ShortLinkRepository {

    ShortLink save(ShortLink link);

    Optional<ShortLink> findById(Long id);

    Optional<ShortLink> findByShortCode(String shortCode);

    boolean existsByShortCode(String shortCode);

    List<ShortLink> findAllByOwnerId(Long ownerId);
}
