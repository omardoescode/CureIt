package com.Curelt.user_service.dto;

import lombok.Builder;

@Builder
public record RefreshTokenResponse(
        String token,
        String refreshToken) {
}
