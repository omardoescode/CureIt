package com.Curelt.user_service.controller;

import com.Curelt.user_service.dto.ChangePasswordRequest;
import com.Curelt.user_service.dto.ResetPasswordRequest;
import com.Curelt.user_service.service.PasswordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("password")
@Slf4j
public class PasswordController {
    private final PasswordService passwordService;


    @PostMapping("change-password")
    public ResponseEntity<String> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        log.info("Change password request: {}", changePasswordRequest);
        passwordService.changePassword(changePasswordRequest);
        return ResponseEntity.ok("Password changed successfully");
    }
    @PostMapping("forget-password")
    public ResponseEntity<String> forgetPassword(@RequestParam String email) {
        passwordService.initiatePasswordReset(email);
        return ResponseEntity.ok("Check your email we will send you an OTP code to reset your password");
    }
    @PostMapping("reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest restPasswordRequest) {
        passwordService.resetPassword(restPasswordRequest);
        return ResponseEntity.ok("Password reset successfully");
    }
}
