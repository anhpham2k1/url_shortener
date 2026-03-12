package com.anhpt.urlshortener.shared.exception;
import org.springframework.http.HttpStatus;
public enum ErrorCode {
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error"),
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Request validation failed"),
    MALFORMED_REQUEST(HttpStatus.BAD_REQUEST, "Malformed request body"),

    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Authentication required"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "Access denied"),

    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "User not found"),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "Email already exists"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Invalid email or password"),
    USER_INACTIVE(HttpStatus.FORBIDDEN, "User account is inactive"),

    LINK_NOT_FOUND(HttpStatus.NOT_FOUND, "Short link not found"),
    LINK_EXPIRED(HttpStatus.GONE, "Short link expired"),
    LINK_DISABLED(HttpStatus.GONE, "Short link disabled"),
    ALIAS_ALREADY_EXISTS(HttpStatus.CONFLICT, "Alias already exists"),

    QUOTA_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS, "Quota exceeded"),
    RATE_LIMIT_EXCEEDED(HttpStatus.TOO_MANY_REQUESTS, "Rate limit exceeded");

    private final HttpStatus httpStatus;
    private final String defaultMessage;

    ErrorCode(HttpStatus httpStatus, String defaultMessage) {
        this.httpStatus = httpStatus;
        this.defaultMessage = defaultMessage;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}
