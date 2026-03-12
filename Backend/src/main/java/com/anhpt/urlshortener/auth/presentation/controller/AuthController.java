package com.anhpt.urlshortener.auth.presentation.controller;

import com.anhpt.urlshortener.auth.application.dto.request.LoginRequest;
import com.anhpt.urlshortener.auth.application.dto.request.RegisterRequest;
import com.anhpt.urlshortener.auth.application.dto.response.AuthResponse;
import com.anhpt.urlshortener.auth.application.usecase.LoginUseCase;
import com.anhpt.urlshortener.auth.application.usecase.RegisterUseCase;
import com.anhpt.urlshortener.shared.response.ApiResponse;
import com.anhpt.urlshortener.user.application.dto.response.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final RegisterUseCase registerUseCase;
    private final LoginUseCase loginUseCase;

    public AuthController(RegisterUseCase registerUseCase,
                          LoginUseCase loginUseCase) {
        this.registerUseCase = registerUseCase;
        this.loginUseCase = loginUseCase;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = registerUseCase.execute(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Register successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = loginUseCase.execute(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successfully"));
    }
}
