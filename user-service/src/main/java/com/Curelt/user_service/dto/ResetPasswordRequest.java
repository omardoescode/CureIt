package com.Curelt.user_service.dto;

import com.Curelt.user_service.Validators.ValidPassword;

public record ResetPasswordRequest(String email,
                                   String otp,
                                   @ValidPassword String newPassword) {
}
