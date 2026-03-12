package com.anhpt.urlshortener.auth.application.usecase;

import com.anhpt.urlshortener.auth.application.dto.request.LoginRequest;
import com.anhpt.urlshortener.auth.application.dto.response.AuthResponse;
import com.anhpt.urlshortener.auth.infrastructure.security.JwtService;
import com.anhpt.urlshortener.shared.exception.ErrorCode;
import com.anhpt.urlshortener.shared.exception.ForbiddenException;
import com.anhpt.urlshortener.shared.exception.UnauthorizedException;
import com.anhpt.urlshortener.user.application.dto.response.UserResponse;
import com.anhpt.urlshortener.user.application.mapper.UserMapper;
import com.anhpt.urlshortener.user.domain.model.User;
import com.anhpt.urlshortener.user.domain.model.UserStatus;
import com.anhpt.urlshortener.user.domain.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class LoginUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    public LoginUseCase(UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        JwtService jwtService,
                        UserMapper userMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userMapper = userMapper;
    }

    public AuthResponse execute(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException(ErrorCode.INVALID_CREDENTIALS);
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ForbiddenException(ErrorCode.USER_INACTIVE);
        }

        String token = jwtService.generateAccessToken(user);
        UserResponse userResponse = userMapper.toResponse(user);

        return new AuthResponse(token, userResponse);
    }
}
