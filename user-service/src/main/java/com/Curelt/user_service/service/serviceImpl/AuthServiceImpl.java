package com.Curelt.user_service.service.serviceImpl;

import com.Curelt.user_service.dto.LoginRegisterResponse;
import com.Curelt.user_service.dto.LoginRequest;
import com.Curelt.user_service.dto.RefreshTokenResponse;
import com.Curelt.user_service.dto.UserRegisterRequest;
import com.Curelt.user_service.entities.File;
import com.Curelt.user_service.entities.User;
import com.Curelt.user_service.enums.FileType;
import com.Curelt.user_service.enums.UserRole;
import com.Curelt.user_service.exceptionsAndHandlers.DuplicatedEmailException;
import com.Curelt.user_service.exceptionsAndHandlers.UserNotFoundException;
import com.Curelt.user_service.mapper.UserMapper;
import com.Curelt.user_service.repository.FileRepository;
import com.Curelt.user_service.repository.UserRepository;
import com.Curelt.user_service.service.AuthService;
import com.Curelt.user_service.service.CloudinaryService;
import com.Curelt.user_service.service.FileService;
import com.Curelt.user_service.service.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {
    private final UserMapper userMapper;


    private final UserRepository userRepository;
    private final FileRepository fileRepository;

    private final JwtService jwtService;
    private final CloudinaryService cloudinaryService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager ;
    private final FileService fileService;

    @Override
    @Transactional
    public LoginRegisterResponse registerUser(UserRegisterRequest request , MultipartFile profilePicture) {
        validateEmailNotUsedBefore(request.email());
        User user = userMapper.toUser(request);
        user.setRole(UserRole.USER);
        user.setPassword(passwordEncoder.encode(request.password()));


        if (profilePicture != null) {
            File file = fileService.handleFileUpload(profilePicture, FileType.PROFILE_PICTURE, user);
            fileRepository.save(file);
        }
        userRepository.save(user);
        return generateLoginRegisterResponse(user);

    }
    @Override
    public LoginRegisterResponse authenticate(LoginRequest loginRequest) {
        var user=validateEmailExists(loginRequest.email());
        try{
            authenticationManager.authenticate
                    (new UsernamePasswordAuthenticationToken(
                            loginRequest.email(),
                            loginRequest.password()));
        } catch (Exception e) {
            throw new UserNotFoundException("Invalid email or password");
        }
        return generateLoginRegisterResponse(user);
    }


    @Override
    public RefreshTokenResponse refreshToken(HttpServletRequest request, HttpServletResponse response) {

        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return null;
        }

        String refreshToken = authHeader.substring(7);
        String userEmail = jwtService.extractUsername(refreshToken);

        if (userEmail == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return null;
        }

        User user=validateEmailExists(userEmail);

        if (jwtService.isTokenExpired(refreshToken)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return null;
        }

        String newAccessToken = jwtService.generateToken(user);
        RefreshTokenResponse refreshResponse = RefreshTokenResponse.builder().token(newAccessToken).refreshToken(refreshToken).build();
        try {
            new ObjectMapper().writeValue(response.getOutputStream(), refreshResponse);
        } catch (IOException e) {
            throw new RuntimeException("Error writing response", e);
        }

        return refreshResponse;
    }
    public void validateEmailNotUsedBefore(String email){
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()){
            throw new DuplicatedEmailException("Email already exists");
        }
    }
    public User validateEmailExists(String email){
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Invalid email or password"));
    }


    private LoginRegisterResponse generateLoginRegisterResponse(User user){
        var jwtToken=jwtService.generateToken(user);
        var jwtRefreshToken=jwtService.generateRefreshToken(user);
        return  LoginRegisterResponse.builder()
                .token(jwtToken)
                .refreshToken(jwtRefreshToken)
                .role(user.getRole())
                .build();
    }






}
