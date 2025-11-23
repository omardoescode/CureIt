package com.Curelt.user_service.filters;

import com.Curelt.user_service.service.CustomUserDetailsService;
import com.Curelt.user_service.service.JwtService;
import com.Curelt.user_service.service.RedisService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Objects;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final RedisService redisService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwtToken;
        final String userEmail;

        log.info("=== JwtAuthenticationFilter triggered for request: {} {}", request.getMethod(), request.getRequestURI());

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("No Authorization header or Bearer token not found.");
            filterChain.doFilter(request, response);
            return;
        }

        jwtToken = authHeader.substring(7);
        log.debug("Extracted JWT token: {}", jwtToken);

        try {
            // Check if token is expired
            if (jwtService.isTokenExpired(jwtToken)) {
                log.warn("JWT token is expired.");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

            // Check if token is blacklisted in Redis
            String jti = jwtService.extractClaim(jwtToken, Claims::getId);
            log.debug("Extracted JTI: {}", jti);

            if (Objects.nonNull(jti) && redisService.hasKey(jti)) {
                log.warn("JWT token with JTI {} found in Redis blacklist.", jti);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

            // Extract username from token
            userEmail = jwtService.extractUsername(jwtToken);
            log.info("Extracted username/email from token: {}", userEmail);

            // Authenticate user if not already authenticated
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                log.debug("No authentication found in SecurityContext, loading user details...");

                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                log.debug("UserDetails loaded: username={}, authorities={}", userDetails.getUsername(), userDetails.getAuthorities());

                if (jwtService.isTokenValid(jwtToken, userDetails)) {
                    log.info("JWT token is valid. Setting authentication for user: {}", userEmail);

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    log.warn("JWT token is not valid for user: {}", userEmail);
                }
            }

        } catch (ExpiredJwtException e) {
            log.error("ExpiredJwtException: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        } catch (MalformedJwtException e) {
            log.error("MalformedJwtException: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        } catch (UsernameNotFoundException e) {
            log.error("UsernameNotFoundException: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        } catch (Exception e) {
            log.error("Unexpected exception during JWT filter: ", e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return;
        }

        log.info("JwtAuthenticationFilter finished successfully for request: {}", request.getRequestURI());
        filterChain.doFilter(request, response);
    }
}
