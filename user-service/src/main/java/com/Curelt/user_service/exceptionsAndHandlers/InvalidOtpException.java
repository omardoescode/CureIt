package com.Curelt.user_service.exceptionsAndHandlers;

public class InvalidOtpException extends RuntimeException {
    public InvalidOtpException(String message) {
        super(message);
    }
}
