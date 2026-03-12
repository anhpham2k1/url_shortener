package com.anhpt.urlshortener.user.application.usecase;

import com.anhpt.urlshortener.shared.exception.ErrorCode;
import com.anhpt.urlshortener.shared.exception.ResourceNotFoundException;
import com.anhpt.urlshortener.shared.security.SecurityUtils;
import com.anhpt.urlshortener.user.application.dto.response.UserResponse;
import com.anhpt.urlshortener.user.application.mapper.UserMapper;
import com.anhpt.urlshortener.user.domain.model.User;
import com.anhpt.urlshortener.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class GetCurrentUserUseCase {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public GetCurrentUserUseCase(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    public UserResponse execute() {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));

        return userMapper.toResponse(user);
    }
}
