package com.Curelt.user_service.service;

import com.Curelt.user_service.dto.LoginRegisterResponse;
import com.Curelt.user_service.dto.LoginRequest;
import com.Curelt.user_service.dto.RefreshTokenResponse;
import com.Curelt.user_service.dto.UserRegisterRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;


public interface AuthService {
    LoginRegisterResponse authenticate(LoginRequest loginRequest);
    RefreshTokenResponse refreshToken(HttpServletRequest request, HttpServletResponse response);
    LoginRegisterResponse registerUser(UserRegisterRequest request, MultipartFile profilePicture) throws IOException;

}
