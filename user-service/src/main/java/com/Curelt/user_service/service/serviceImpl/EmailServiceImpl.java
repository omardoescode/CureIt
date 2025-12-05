package com.Curelt.user_service.service.serviceImpl;

import com.Curelt.user_service.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;


    @Override
    public void sendOTPCode(String OTP, String email) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);

            Context context = new Context();
            context.setVariable("otp", OTP);
            String htmlContent = templateEngine.process("emails/password-reset", context);

            helper.setText(htmlContent, true);
            helper.setTo(email);
            helper.setFrom("PharmaApp@gmail.com");
            helper.setSubject("Password Reset - OTP Code");

            mailSender.send(mimeMessage);

        } catch (Exception e) {
            log.error("Failed to send email for user {}: {}", email, e.getMessage());
        }
    }

}
