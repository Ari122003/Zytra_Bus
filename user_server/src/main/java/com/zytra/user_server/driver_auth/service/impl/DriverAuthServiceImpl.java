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

    /**
     * Handles driver login authentication.
     * Validates credentials, checks driver status, decrypts and verifies password,
     * generates access and refresh tokens, and updates last login timestamp.
     * 
     * @param request the DriverLoginRequest containing email and password
     * @return DriverLoginResponse containing access token, refresh token, and
     *         driver information
     * @throws DriverInvalidCredentialException if email is missing or credentials
     *                                          are invalid
     * @throws DriverInvalidAccountException    if driver account is not ACTIVE or
     *                                          password not set
     */
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

        String decryptedPassword;
        try {
            decryptedPassword = PasswordUtil.decrypt(passwordHash);
        } catch (Exception e) {
            decryptedPassword = passwordHash;
        }

        if (!decryptedPassword.equals(request.getPassword())) {
            throw new DriverInvalidCredentialException("Invalid Credentials");
        }

        String accessToken = jwtUtil.generateAccessToken(driver);
        String refreshToken = jwtUtil.generateRefreshToken(driver);
        long expiresIn = jwtUtil.getAccessTokenExpirySeconds();

        driverRefreshTokenService.createRefreshToken(driver.getId(), refreshToken, null, null);

        driver.setLastLoginAt(LocalDateTime.now());
        driverRepository.save(driver);

        return new DriverLoginResponse("Login successful", driver.getStatus(), driver.getId(), accessToken,
                refreshToken, Long.valueOf(expiresIn));
    }

    /**
     * Registers a new driver account.
     * Validates input data, checks for duplicate email, encrypts password,
     * creates driver entity, generates authentication tokens, and updates last
     * login.
     * 
     * @param request the DriverRegisterRequest containing name, email, phone, and
     *                password
     * @return DriverRegisterResponse containing access token, refresh token, and
     *         driver information
     * @throws DriverInvalidCredentialException if email or password is missing
     * @throws DriverAlreadyExistsException     if email is already registered
     * @throws DriverInvalidAccountException    if account status prevents login
     *                                          (should not occur in registration)
     */
    @Override
    @Transactional
    public DriverRegisterResponse register(DriverRegisterRequest request) {

        if (request == null || request.getEmail() == null || request.getEmail().isBlank()) {
            throw new DriverInvalidCredentialException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new DriverInvalidCredentialException("Password is required");
        }

        if (driverRepository.existsByEmail(request.getEmail())) {
            throw new DriverAlreadyExistsException("Driver with this email already exists");
        }

        String encryptedPassword = PasswordUtil.encrypt(request.getPassword());

        DriverEntity driver = DriverEntity.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(encryptedPassword)
                .status(DriverStatus.ACTIVE)
                .role(UserRole.DRIVER)
                .assignedRoute(null)
                .build();

        if (driver.getStatus() != DriverStatus.ACTIVE) {
            throw new DriverInvalidAccountException(
                    "Driver account is " + driver.getStatus().name() + ", cannot login");
        }

        DriverEntity savedDriver = driverRepository.save(driver);

        String accessToken = jwtUtil.generateAccessToken(savedDriver);
        String refreshToken = jwtUtil.generateRefreshToken(savedDriver);
        long expiresIn = jwtUtil.getAccessTokenExpirySeconds();

        driverRefreshTokenService.createRefreshToken(savedDriver.getId(), refreshToken, null, null);

        savedDriver.setLastLoginAt(LocalDateTime.now());
        driverRepository.save(savedDriver);

        return DriverRegisterResponse.builder()
                .message("Driver registered successfully")
                .status(savedDriver.getStatus())
                .driverId(savedDriver.getId())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(expiresIn)
                .build();
    }
}
