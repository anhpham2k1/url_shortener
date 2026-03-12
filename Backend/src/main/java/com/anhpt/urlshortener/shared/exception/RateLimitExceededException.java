package com.anhpt.urlshortener.shared.exception;

public class RateLimitExceededException extends BusinessException {
    public RateLimitExceededException(ErrorCode errorCode) {
        super(errorCode);
    }

    public RateLimitExceededException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
}