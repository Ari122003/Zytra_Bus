package com.zytra.user_server.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zytra.user_server.auth.dto.request.LoginRequest;
import com.zytra.user_server.auth.dto.request.RefreshTokenRequest;
import com.zytra.user_server.auth.dto.request.VerifyOtpRequest;
import com.zytra.user_server.auth.dto.response.LoginResponse;
import com.zytra.user_server.auth.entity.RefreshTokenEntity;
import com.zytra.user_server.user.entity.UserEntity;
import com.zytra.user_server.auth.exception.InvalidCredentialException;
import com.zytra.user_server.user.repository.UserRepository;
import com.zytra.user_server.auth.service.AuthService;
import com.zytra.user_server.auth.service.RefreshTokenService;
import com.zytra.user_server.auth.service.VerifyOtpService;
import com.zytra.user_server.util.JwtUtil;

import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")

public class AuthController {

    private final AuthService authService;
    private final VerifyOtpService verifyOtpService;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, VerifyOtpService verifyOtpService,
            RefreshTokenService refreshTokenService, UserRepository userRepository,
            JwtUtil jwtUtil) {
        this.authService = authService;
        this.verifyOtpService = verifyOtpService;
        this.refreshTokenService = refreshTokenService;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public LoginResponse loginController(@RequestBody @Valid LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/verify-otp")
    public LoginResponse verifyOtpController(@RequestBody @Valid VerifyOtpRequest request) {
        return verifyOtpService.verifyOtp(request);
    }

    @PostMapping("/refresh")
    public LoginResponse refreshTokenController(@RequestBody @Valid RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        // Validate refresh token and get token entity
        RefreshTokenEntity tokenEntity = refreshTokenService.validateRefreshToken(refreshToken);

        // Get user
        UserEntity user = userRepository.findById(tokenEntity.getUserId())
                .orElseThrow(() -> new InvalidCredentialException("User not found"));

        // Generate new tokens
        String newAccessToken = jwtUtil.generateAccessToken(user);
        String newRefreshToken = jwtUtil.generateRefreshToken(user);
        long expiresIn = jwtUtil.getAccessTokenExpirySeconds();

        // Revoke old refresh token and persist new one (token rotation)
        refreshTokenService.revokeToken(refreshToken);
        refreshTokenService.createRefreshToken(user, newRefreshToken, null, null);

        return new LoginResponse("Token refreshed successfully", user.getStatus(), user.getId(),
                newAccessToken, newRefreshToken, Long.valueOf(expiresIn));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logoutController(@RequestBody @Valid RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        // Revoke the refresh token
        refreshTokenService.revokeToken(refreshToken);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout successful");
        return ResponseEntity.ok(response);
    }
}
