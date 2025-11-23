package com.Curelt.user_service.service;

import com.Curelt.user_service.dto.ChangePasswordRequest;
import com.Curelt.user_service.dto.ResetPasswordRequest;

public interface PasswordService {
    void initiatePasswordReset(String email);
    void resetPassword(ResetPasswordRequest resetPasswordRequest);
    void changePassword(ChangePasswordRequest changePasswordRequest);
}
