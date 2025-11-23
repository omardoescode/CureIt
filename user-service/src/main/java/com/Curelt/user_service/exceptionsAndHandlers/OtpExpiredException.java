package com.Curelt.user_service.exceptionsAndHandlers;

public class OtpExpiredException extends RuntimeException {
    public OtpExpiredException(String message) {
        super(message);
    }
}
