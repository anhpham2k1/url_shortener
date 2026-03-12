package com.anhpt.urlshortener.user.domain.model;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class User {
    private Long id;
    private String email;
    private String passwordHash;
    private String fullName;
    private UserRole role;
    private UserPlan plan;
    private UserStatus status;
    private Instant createdAt;
    private Instant updatedAt;

    public User() {
    }

    public User(Long id, String email, String passwordHash, String fullName,
                UserRole role, UserPlan plan, UserStatus status,
                Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.role = role;
        this.plan = plan;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // getters/setters
}