package com.Curelt.user_service.service;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LogoutService implements LogoutHandler {
    private final RedisService redisService;
    private final JwtService jwtService;

    @Value("${jwt.access-token-expiration}")
    private long jwtExpiration;
    @Override
    public void logout(HttpServletRequest request,
                       HttpServletResponse response,
                       Authentication authentication) {

        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return;
        }

        final String jwtToken = authHeader.substring(7);

        String jti = jwtService.extractClaim(jwtToken, Claims::getId);
        if (jti == null) {

            throw new IllegalStateException("JWT does not contain jti (id) claim");
        }

        long expireMins = jwtExpiration / 60000;

        redisService.setInRedis(jti, "true", expireMins);

        SecurityContextHolder.clearContext();
    }
}
