package com.anhpt.urlshortener.user.presentation.controller;

import com.anhpt.urlshortener.shared.response.ApiResponse;
import com.anhpt.urlshortener.user.application.dto.request.ChangePasswordRequest;
import com.anhpt.urlshortener.user.application.dto.request.UpdateProfileRequest;
import com.anhpt.urlshortener.user.application.dto.response.UserResponse;
import com.anhpt.urlshortener.user.application.usecase.ChangePasswordUseCase;
import com.anhpt.urlshortener.user.application.usecase.DeleteAccountUseCase;
import com.anhpt.urlshortener.user.application.usecase.GetCurrentUserUseCase;
import com.anhpt.urlshortener.user.application.usecase.UpdateProfileUseCase;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final GetCurrentUserUseCase getCurrentUserUseCase;
    private final UpdateProfileUseCase updateProfileUseCase;
    private final ChangePasswordUseCase changePasswordUseCase;
    private final DeleteAccountUseCase deleteAccountUseCase;

    public UserController(GetCurrentUserUseCase getCurrentUserUseCase,
                          UpdateProfileUseCase updateProfileUseCase,
                          ChangePasswordUseCase changePasswordUseCase,
                          DeleteAccountUseCase deleteAccountUseCase) {
        this.getCurrentUserUseCase = getCurrentUserUseCase;
        this.updateProfileUseCase = updateProfileUseCase;
        this.changePasswordUseCase = changePasswordUseCase;
        this.deleteAccountUseCase = deleteAccountUseCase;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me() {
        UserResponse response = getCurrentUserUseCase.execute();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        UserResponse response = updateProfileUseCase.execute(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Profile updated successfully"));
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        changePasswordUseCase.execute(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully"));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteAccount() {
        deleteAccountUseCase.execute();
        return ResponseEntity.ok(ApiResponse.success(null, "Account deactivated successfully"));
    }
}