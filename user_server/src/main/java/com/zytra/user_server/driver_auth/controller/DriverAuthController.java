package com.zytra.user_server.driver_auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zytra.user_server.auth.dto.request.RefreshTokenRequest;
import com.zytra.user_server.driver_auth.dto.request.DriverLoginRequest;
import com.zytra.user_server.driver_auth.dto.request.DriverRegisterRequest;
import com.zytra.user_server.driver_auth.dto.response.DriverLoginResponse;
import com.zytra.user_server.driver_auth.dto.response.DriverRegisterResponse;
import com.zytra.user_server.driver_auth.entity.DriverRefreshTokenEntity;
import com.zytra.user_server.driver.entity.DriverEntity;
import com.zytra.user_server.auth.exception.InvalidCredentialException;
import com.zytra.user_server.driver.repository.DriverRepository;
import com.zytra.user_server.driver_auth.service.DriverAuthService;
import com.zytra.user_server.driver_auth.service.DriverRefreshTokenService;
import com.zytra.user_server.util.JwtUtil;

import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/driver")
public class DriverAuthController {

    private final DriverAuthService driverAuthService;
    private final DriverRefreshTokenService driverRefreshTokenService;
    private final DriverRepository driverRepository;
    private final JwtUtil jwtUtil;

    public DriverAuthController(DriverAuthService driverAuthService,
            DriverRefreshTokenService driverRefreshTokenService,
            DriverRepository driverRepository,
            JwtUtil jwtUtil) {
        this.driverAuthService = driverAuthService;
        this.driverRefreshTokenService = driverRefreshTokenService;
        this.driverRepository = driverRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/auth/register")
    public DriverRegisterResponse driverRegisterController(@RequestBody @Valid DriverRegisterRequest request) {
        return driverAuthService.register(request);
    }

    @PostMapping("/auth/login")
    public DriverLoginResponse driverLoginController(@RequestBody @Valid DriverLoginRequest request) {
        return driverAuthService.login(request);
    }

    @PostMapping("/auth/refresh")
    public DriverLoginResponse driverRefreshTokenController(@RequestBody @Valid RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        // Validate refresh token and get token entity
        DriverRefreshTokenEntity tokenEntity = driverRefreshTokenService.validateRefreshToken(refreshToken);

        // Get driver
        DriverEntity driver = driverRepository.findById(tokenEntity.getDriverId())
                .orElseThrow(() -> new InvalidCredentialException("Driver not found"));

        // Generate new tokens
        String newAccessToken = jwtUtil.generateAccessToken(driver);
        String newRefreshToken = jwtUtil.generateRefreshToken(driver);
        long expiresIn = jwtUtil.getAccessTokenExpirySeconds();

        // Revoke old refresh token and persist new one (token rotation)
        driverRefreshTokenService.revokeToken(refreshToken);
        driverRefreshTokenService.createRefreshToken(driver.getId(), newRefreshToken, null, null);

        return new DriverLoginResponse("Token refreshed successfully", driver.getStatus(), driver.getId(),
                newAccessToken, newRefreshToken, Long.valueOf(expiresIn));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> driverLogoutController(@RequestBody @Valid RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        // Revoke the refresh token
        driverRefreshTokenService.revokeToken(refreshToken);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout successful");
        return ResponseEntity.ok(response);
    }
}
