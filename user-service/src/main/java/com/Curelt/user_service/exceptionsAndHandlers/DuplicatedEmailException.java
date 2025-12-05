package com.Curelt.user_service.exceptionsAndHandlers;

public class DuplicatedEmailException extends RuntimeException {
    public DuplicatedEmailException(String message) {
        super(message);
    }
}
