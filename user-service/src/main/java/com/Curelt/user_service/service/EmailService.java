package com.Curelt.user_service.service;

public interface EmailService {
    void sendOTPCode(String OTP, String email);
}
