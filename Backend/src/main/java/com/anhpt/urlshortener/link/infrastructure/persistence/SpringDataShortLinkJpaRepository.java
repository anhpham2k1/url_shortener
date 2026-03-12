package com.anhpt.urlshortener.link.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SpringDataShortLinkJpaRepository extends JpaRepository<ShortLinkEntity, Long> {

    Optional<ShortLinkEntity> findByShortCode(String shortCode);

    boolean existsByShortCode(String shortCode);

    List<ShortLinkEntity> findAllByOwnerId(Long ownerId);
}
