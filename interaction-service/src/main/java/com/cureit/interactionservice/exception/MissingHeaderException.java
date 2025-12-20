package com.cureit.interactionservice.exception;

import lombok.Getter;

@Getter
public class MissingHeaderException extends RuntimeException {
    private final String message;
    private final String code;
    private final String header;

    public MissingHeaderException(String message, String code, String header) {
        super("Header missing: " + header);
        this.message = message;
        this.code = code;
        this.header = header;
    }
}
