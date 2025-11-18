package com.cureit.contentprocessing.exception;

import lombok.*;

import java.util.Map;

@Getter
public class ApiException extends RuntimeException {
    private final Map<String, Object> details;
    private final String code;

    public ApiException(String message, String code, Map<String, Object> details) {
        super(message);
        this.code = code;
        this.details = details;
    }

    public ApiException(String message) {
        super(message);
        this.details = null;
        this.code = null;
    }

    public ApiException(String message, Exception e) {
        super(message);
        this.details = null;
        this.code = null;
    }
}
