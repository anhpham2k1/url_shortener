package com.anhpt.urlshortener.user.application.usecase;

import com.anhpt.urlshortener.shared.exception.ErrorCode;
import com.anhpt.urlshortener.shared.exception.ResourceNotFoundException;
import com.anhpt.urlshortener.shared.security.SecurityUtils;
import com.anhpt.urlshortener.user.domain.model.User;
import com.anhpt.urlshortener.user.domain.model.UserStatus;
import com.anhpt.urlshortener.user.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class DeleteAccountUseCase {

    private final UserRepository userRepository;

    public DeleteAccountUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void execute() {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));

        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);
    }
}
