package com.anhpt.urlshortener.user.application.mapper;

import com.anhpt.urlshortener.user.application.dto.response.UserResponse;
import com.anhpt.urlshortener.user.domain.model.User;
import com.anhpt.urlshortener.user.infrastructure.persistence.UserEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toDomain(UserEntity entity);
    UserEntity toEntity(User domain);
    UserResponse toResponse(User domain);
}
