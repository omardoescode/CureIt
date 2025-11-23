package com.Curelt.user_service.controller;

import com.Curelt.user_service.dto.LoginRegisterResponse;
import com.Curelt.user_service.dto.LoginRequest;
import com.Curelt.user_service.dto.UserRegisterRequest;
import com.Curelt.user_service.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Validator;
import java.io.IOException;
import java.util.Set;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final Validator validator;
    private final ObjectMapper objectMapper; // Spring ObjectMapper injected

    @GetMapping("/test")
    public String test() {
        return "not secure";
    }



    @PostMapping("login")
    public ResponseEntity<LoginRegisterResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.status(200).body(authService.authenticate(loginRequest));
    }
    @PostMapping(value = "register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<LoginRegisterResponse> registerUser(
            @RequestPart("user") String userJson,
            @RequestPart(value = "profilePicture" , required = false) MultipartFile profilePicture


    ) throws IOException {

       UserRegisterRequest userRequest =
                objectMapper.readValue(userJson, UserRegisterRequest.class);

        Set<ConstraintViolation<UserRegisterRequest>> violations = validator.validate(userRequest);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException("Validation failed for UserRegisterRequest", violations);
        }


        return ResponseEntity.ok(authService.registerUser(userRequest, profilePicture));
    }
    @PostMapping("/refresh-token")
    public void refreshToken(
            HttpServletRequest request ,
            HttpServletResponse response
    ) throws IOException {
        authService.refreshToken(request, response);
    }
}
