package com.anhpt.urlshortener.link.application.mapper;

import com.anhpt.urlshortener.link.application.dto.response.ShortLinkResponse;
import com.anhpt.urlshortener.link.domain.model.ShortLink;
import com.anhpt.urlshortener.link.infrastructure.persistence.ShortLinkEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ShortLinkMapper {

    @Mapping(source = "owner.id", target = "ownerId")
    ShortLink toDomain(ShortLinkEntity entity);

    @Mapping(source = "ownerId", target = "owner.id")
    ShortLinkEntity toEntity(ShortLink domain);

    @Mapping(target = "shortUrl", ignore = true)
    @Mapping(target = "clicks", ignore = true)
    ShortLinkResponse toResponse(ShortLink domain);
}
