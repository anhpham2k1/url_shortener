package com.anhpt.urlshortener.auth.application.usecase;

import com.anhpt.urlshortener.auth.application.dto.request.RegisterRequest;
import com.anhpt.urlshortener.shared.exception.ConflictException;
import com.anhpt.urlshortener.shared.exception.ErrorCode;
import com.anhpt.urlshortener.user.application.dto.response.UserResponse;
import com.anhpt.urlshortener.user.application.mapper.UserMapper;
import com.anhpt.urlshortener.user.domain.model.User;
import com.anhpt.urlshortener.user.domain.model.UserPlan;
import com.anhpt.urlshortener.user.domain.model.UserRole;
import com.anhpt.urlshortener.user.domain.model.UserStatus;
import com.anhpt.urlshortener.user.domain.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class RegisterUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public RegisterUseCase(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           UserMapper userMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }

    public UserResponse execute(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setRole(UserRole.USER);
        user.setPlan(UserPlan.FREE);
        user.setStatus(UserStatus.ACTIVE);

        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }
}
