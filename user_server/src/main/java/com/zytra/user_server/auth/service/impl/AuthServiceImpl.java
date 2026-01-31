package com.zytra.user_server.auth.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zytra.user_server.Notification.EmailService;
import com.zytra.user_server.auth.dto.request.LoginRequest;
import com.zytra.user_server.auth.dto.response.LoginResponse;
import com.zytra.user_server.auth.entity.OtpEntity;
import com.zytra.user_server.user.entity.UserEntity;
import com.zytra.user_server.enums.UserStatus;
import com.zytra.user_server.auth.exception.InvalidCredentialException;
import com.zytra.user_server.auth.exception.InvalidUserException;
import com.zytra.user_server.auth.repository.OtpRepository;
import com.zytra.user_server.user.repository.UserRepository;
import com.zytra.user_server.auth.service.AuthService;
import com.zytra.user_server.auth.service.RefreshTokenService;
import com.zytra.user_server.util.OtpUtil;
import com.zytra.user_server.util.PasswordUtil;
import com.zytra.user_server.util.JwtUtil;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthServiceImpl implements AuthService {
    private final OtpRepository otpRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    public AuthServiceImpl(OtpRepository otpRepository, EmailService emailService, UserRepository userRepository,
            JwtUtil jwtUtil, RefreshTokenService refreshTokenService) {
        this.otpRepository = otpRepository;
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
    }

    /**
     * Handles user login authentication.
     * For existing ACTIVE users: validates credentials and returns access/refresh
     * tokens.
     * For new or non-active users: generates and sends OTP for verification.
     * Handles password decryption, user status validation, and token generation.
     * 
     * @param request the LoginRequest containing email and password
     * @return LoginResponse with tokens for successful login or OTP sent status for
     *         new users
     * @throws InvalidCredentialException if email is missing or credentials are
     *                                    invalid
     * @throws InvalidUserException       if user is BLOCKED or DELETED, or password
     *                                    is not set
     */
    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {

        if (request == null || request.getEmail() == null || request.getEmail().isBlank()) {
            throw new InvalidCredentialException("Email is required");
        }

        UserEntity user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user != null) {
            UserStatus status = user.getStatus();

            if (status == UserStatus.ACTIVE) {
                String passwordHash = user.getPasswordHash();
                if (passwordHash == null || passwordHash.isEmpty()) {
                    throw new InvalidUserException("User has not set a password, cannot login");
                }

                String decryptedPassword;
                try {
                    decryptedPassword = PasswordUtil.decrypt(passwordHash);
                } catch (Exception e) {
                    decryptedPassword = passwordHash;
                }

                if (!decryptedPassword.equals(request.getPassword())) {
                    throw new InvalidCredentialException("Invalid Credentials");
                }

                String accessToken = jwtUtil.generateAccessToken(user);
                String refreshToken = jwtUtil.generateRefreshToken(user);
                long expiresIn = jwtUtil.getAccessTokenExpirySeconds();

                refreshTokenService.createRefreshToken(user, refreshToken, null, null);

                user.setLastLoginAt(LocalDateTime.now());
                userRepository.save(user);

                return new LoginResponse("Login successful", UserStatus.ACTIVE, user.getId(), accessToken,
                        refreshToken, Long.valueOf(expiresIn));
            }

            if (status == UserStatus.BLOCKED || status == UserStatus.DELETED) {
                throw new InvalidUserException("This user id is " + status.name() + ", cannot login");
            }

        }

        otpRepository.deleteByEmail(request.getEmail());
        otpRepository.flush();

        String otp = OtpUtil.generateOtp();
        String hashedOtp = OtpUtil.hashOtp(otp);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiryTime = now.plusMinutes(5);
        OtpEntity otpEntity = new OtpEntity();
        otpEntity.setEmail(request.getEmail());
        otpEntity.setOtpHash(hashedOtp);
        otpEntity.setCreatedAt(now);
        otpEntity.setExpiresAt(expiryTime);
        otpRepository.save(otpEntity);

        Map<String, Object> otpVars = new HashMap<>();
        otpVars.put("otp", otp);
        otpVars.put("expiryMinutes", 5);
        emailService.sendEmail(request.getEmail(), "Your OTP for Verification", "emails/otp-verification", otpVars);

        return new LoginResponse("OTP sent successfully", UserStatus.PENDING_VERIFICATION);
    }

}
