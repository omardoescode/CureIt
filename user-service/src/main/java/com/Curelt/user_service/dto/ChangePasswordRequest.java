package com.Curelt.user_service.dto;

import com.Curelt.user_service.Validators.ValidPassword;

public record ChangePasswordRequest(String oldPassword,
                                    @ValidPassword String newPassword) {
}
