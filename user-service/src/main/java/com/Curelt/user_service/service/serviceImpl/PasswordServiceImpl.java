package com.Curelt.user_service.service.serviceImpl;

import com.Curelt.user_service.dto.ChangePasswordRequest;
import com.Curelt.user_service.dto.ResetPasswordRequest;
import com.Curelt.user_service.entities.User;
import com.Curelt.user_service.exceptionsAndHandlers.InvalidOtpException;
import com.Curelt.user_service.exceptionsAndHandlers.OtpExpiredException;
import com.Curelt.user_service.exceptionsAndHandlers.UserNotFoundException;
import com.Curelt.user_service.repository.UserRepository;
import com.Curelt.user_service.service.EmailService;
import com.Curelt.user_service.service.PasswordService;
import com.Curelt.user_service.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
@Slf4j
@RequiredArgsConstructor
@Service
public class PasswordServiceImpl implements PasswordService {
    private final UserRepository userRepository;
    private final RedisService redisService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private static final SecureRandom secureRandom = new SecureRandom();
    public static String generateOTP() {
        int otp = 1000 + secureRandom.nextInt(9000);
        return String.valueOf(otp);
    }

    public void initiatePasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("This email isn't found"));


        redisService.delete(String.valueOf(user.getId()));
        String otp = generateOTP();
        redisService.setInRedis(String.valueOf(user.getId()), otp, 15);
        emailService.sendOTPCode(otp,user.getEmail());


    }
    public void resetPassword(ResetPasswordRequest resetPasswordRequest) {
        User user = userRepository.findByEmail(resetPasswordRequest.email())
                .orElseThrow(() -> new UserNotFoundException("This email isn't found"));
        Long userId=user.getId();
        if (redisService.hasKey(String.valueOf(userId))) {
            String storedOTP=redisService.get(String.valueOf(userId));
            if (!resetPasswordRequest.otp().equals(storedOTP)) {
                throw new InvalidOtpException("Invalid OTP");
            }
            user.setPassword(passwordEncoder.encode(resetPasswordRequest.newPassword()));
            userRepository.save(user);
            redisService.delete(String.valueOf(userId));

        }
        else{
            throw new OtpExpiredException("OTP has expired");
        }

    }
    public void changePassword(ChangePasswordRequest changePasswordRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        log.info("Changing password for user "+email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        log.info("User with email "+email +"found");

        if (!passwordEncoder.matches(changePasswordRequest.oldPassword(), user.getPassword())) {
            log.info("Old password does not match");
            throw new IllegalArgumentException("Old password is not correct");
        }
        log.info("Changing password for user "+email);
        user.setPassword(passwordEncoder.encode(changePasswordRequest.newPassword()));
        userRepository.save(user);
    }
}
