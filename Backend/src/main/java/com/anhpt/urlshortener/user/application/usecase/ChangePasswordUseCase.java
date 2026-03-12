package com.anhpt.urlshortener.user.application.usecase;

import com.anhpt.urlshortener.shared.exception.ErrorCode;
import com.anhpt.urlshortener.shared.exception.ResourceNotFoundException;
import com.anhpt.urlshortener.shared.exception.UnauthorizedException;
import com.anhpt.urlshortener.shared.security.SecurityUtils;
import com.anhpt.urlshortener.user.application.dto.request.ChangePasswordRequest;
import com.anhpt.urlshortener.user.domain.model.User;
import com.anhpt.urlshortener.user.domain.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class ChangePasswordUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ChangePasswordUseCase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void execute(ChangePasswordRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException(ErrorCode.INVALID_CREDENTIALS);
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }
}
