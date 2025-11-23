package com.Curelt.user_service.dto;

import com.Curelt.user_service.enums.UserRole;
import lombok.Builder;

@Builder
public record LoginRegisterResponse(
        String  token,
        String refreshToken,
        UserRole role) {
}
