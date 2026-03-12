package com.anhpt.urlshortener.link.infrastructure.persistence;

import com.anhpt.urlshortener.link.application.mapper.ShortLinkMapper;
import com.anhpt.urlshortener.link.domain.model.ShortLink;
import com.anhpt.urlshortener.link.domain.repository.ShortLinkRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class ShortLinkRepositoryImpl implements ShortLinkRepository {

    private final SpringDataShortLinkJpaRepository jpaRepository;
    private final ShortLinkMapper shortLinkMapper;

    public ShortLinkRepositoryImpl(SpringDataShortLinkJpaRepository jpaRepository,
                                   ShortLinkMapper shortLinkMapper) {
        this.jpaRepository = jpaRepository;
        this.shortLinkMapper = shortLinkMapper;
    }

    @Override
    public ShortLink save(ShortLink link) {
        ShortLinkEntity entity = shortLinkMapper.toEntity(link);
        ShortLinkEntity saved = jpaRepository.save(entity);
        return shortLinkMapper.toDomain(saved);
    }

    @Override
    public Optional<ShortLink> findById(Long id) {
        return jpaRepository.findById(id).map(shortLinkMapper::toDomain);
    }

    @Override
    public Optional<ShortLink> findByShortCode(String shortCode) {
        return jpaRepository.findByShortCode(shortCode).map(shortLinkMapper::toDomain);
    }

    @Override
    public boolean existsByShortCode(String shortCode) {
        return jpaRepository.existsByShortCode(shortCode);
    }

    @Override
    public List<ShortLink> findAllByOwnerId(Long ownerId) {
        return jpaRepository.findAllByOwnerId(ownerId).stream()
                .map(shortLinkMapper::toDomain)
                .toList();
    }
}
