package com.Curelt.user_service.exceptionsAndHandlers;

public class DuplicatedUsernameException extends RuntimeException {
    public DuplicatedUsernameException(String message) {
        super(message);
    }
}
