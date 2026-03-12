package com.anhpt.urlshortener.shared.exception;

public class QuotaExceededException extends BusinessException {
    public QuotaExceededException(ErrorCode errorCode) {
        super(errorCode);
    }

    public QuotaExceededException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
}