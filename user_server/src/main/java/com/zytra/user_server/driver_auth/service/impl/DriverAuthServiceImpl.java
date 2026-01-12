package com.zytra.user_server.driver_auth.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zytra.user_server.driver_auth.dto.request.DriverLoginRequest;
import com.zytra.user_server.driver_auth.dto.request.DriverRegisterRequest;
import com.zytra.user_server.driver_auth.dto.response.DriverLoginResponse;
import com.zytra.user_server.driver_auth.dto.response.DriverRegisterResponse;
import com.zytra.user_server.driver.entity.DriverEntity;
import com.zytra.user_server.enums.DriverStatus;
import com.zytra.user_server.enums.UserRole;
import com.zytra.user_server.driver_auth.exception.DriverInvalidCredentialException;
import com.zytra.user_server.driver_auth.exception.DriverInvalidAccountException;
import com.zytra.user_server.driver_auth.exception.DriverAlreadyExistsException;
import com.zytra.user_server.driver.repository.DriverRepository;
import com.zytra.user_server.driver_auth.service.DriverAuthService;
import com.zytra.user_server.driver_auth.service.DriverRefreshTokenService;
import com.zytra.user_server.util.PasswordUtil;
import com.zytra.user_server.util.JwtUtil;

import java.time.LocalDateTime;

@Service
public class DriverAuthServiceImpl implements DriverAuthService {
    private final DriverRepository driverRepository;
    private final JwtUtil jwtUtil;
    private final DriverRefreshTokenService driverRefreshTokenService;

    public DriverAuthServiceImpl(DriverRepository driverRepository,
            JwtUtil jwtUtil, DriverRefreshTokenService driverRefreshTokenService) {
        this.driverRepository = driverRepository;
        this.jwtUtil = jwtUtil;
        this.driverRefreshTokenService = driverRefreshTokenService;
    }

    @Override
    @Transactional
    public DriverLoginResponse login(DriverLoginRequest request) {

        if (request == null || request.getEmail() == null || request.getEmail().isBlank()) {
            throw new DriverInvalidCredentialException("Email is required");
        }

        DriverEntity driver = driverRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new DriverInvalidCredentialException("Invalid Credentials"));

        DriverStatus status = driver.getStatus();

        if (status != DriverStatus.ACTIVE) {
            throw new DriverInvalidAccountException("Driver account is " + status.name() + ", cannot login");
        }

        String passwordHash = driver.getPasswordHash();
        if (passwordHash == null || passwordHash.isEmpty()) {
            throw new DriverInvalidAccountException("Driver has not set a password, cannot login");
        }

        // Try to decrypt (for encrypted passwords) or compare directly (for legacy
        // plain text)
        String decryptedPassword;
        try {
            decryptedPassword = PasswordUtil.decrypt(passwordHash);
        } catch (Exception e) {
            // Legacy plain text password - compare directly
            decryptedPassword = passwordHash;
        }

        if (!decryptedPassword.equals(request.getPassword())) {
            throw new DriverInvalidCredentialException("Invalid Credentials");
        }

        // Generate tokens
        String accessToken = jwtUtil.generateAccessToken(driver);
        String refreshToken = jwtUtil.generateRefreshToken(driver);
        long expiresIn = jwtUtil.getAccessTokenExpirySeconds();

        // Persist refresh token - using driver ID
        driverRefreshTokenService.createRefreshToken(driver.getId(), refreshToken, null, null);

        // Update last login timestamp
        driver.setLastLoginAt(LocalDateTime.now());
        driverRepository.save(driver);

        return new DriverLoginResponse("Login successful", driver.getStatus(), driver.getId(), accessToken,
                refreshToken, Long.valueOf(expiresIn));
    }

    @Override
    @Transactional
    public DriverRegisterResponse register(DriverRegisterRequest request) {

        // Check if driver already exists
        if (driverRepository.existsByEmail(request.getEmail())) {
            throw new DriverAlreadyExistsException("Driver with this email already exists");
        }

        // Encrypt password before storing
        String encryptedPassword = PasswordUtil.encrypt(request.getPassword());

        // Create new driver entity
        DriverEntity driver = new DriverEntity();
        driver.setName(request.getName());
        driver.setEmail(request.getEmail());
        driver.setPhone(request.getPhone());
        driver.setPasswordHash(encryptedPassword);
        driver.setStatus(DriverStatus.ACTIVE);
        driver.setRole(UserRole.DRIVER);
        driver.setAssignedRoute(null); // Will be assigned later by admin

        // Save driver to database
        DriverEntity savedDriver = driverRepository.save(driver);

        return DriverRegisterResponse.builder()
                .message("Driver registered successfully")
                .driverId(savedDriver.getId())
                .email(savedDriver.getEmail())
                .build();
    }
}
