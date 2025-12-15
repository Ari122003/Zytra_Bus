package com.zytra.user_server.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zytra.user_server.dto.request.auth.LoginRequest;
import com.zytra.user_server.dto.response.auth.LoginResponse;
import com.zytra.user_server.entity.OtpEntity;
import com.zytra.user_server.entity.UserEntity;
import com.zytra.user_server.enums.UserStatus;
import com.zytra.user_server.exception.InvalidCredentialException;
import com.zytra.user_server.exception.InvalidUserException;
import com.zytra.user_server.repository.OtpRepository;
import com.zytra.user_server.repository.UserRepository;
import com.zytra.user_server.service.AuthService;
import com.zytra.user_server.service.EmailService;
import com.zytra.user_server.service.RefreshTokenService;
import com.zytra.user_server.util.OtpUtil;
import com.zytra.user_server.util.PasswordUtil;
import com.zytra.user_server.util.JwtUtil;

import java.time.LocalDateTime;

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
                    throw new InvalidCredentialException("Invalid Credentials");
                }

                // Generate tokens
                String accessToken = jwtUtil.generateAccessToken(user);
                String refreshToken = jwtUtil.generateRefreshToken(user);
                long expiresIn = jwtUtil.getAccessTokenExpirySeconds();

                // Persist refresh token
                refreshTokenService.createRefreshToken(user, refreshToken, null, null);

                // Update last login timestamp
                user.setLastLoginAt(LocalDateTime.now());
                userRepository.save(user);

                return new LoginResponse("Login successful", UserStatus.ACTIVE, user.getId(), accessToken,
                        refreshToken, Long.valueOf(expiresIn));
            }

            if (status == UserStatus.BLOCKED || status == UserStatus.DELETED) {
                throw new InvalidUserException("This user id is " + status.name() + ", cannot login");
            }

        }

        // Clear any existing OTP for this email before issuing a new one
        otpRepository.deleteByEmail(request.getEmail());
        otpRepository.flush();

        // Generate and save OTP (replace any existing entry for this email)
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

        emailService.sendEmail(request.getEmail(), otp);

        return new LoginResponse("OTP sent successfully", UserStatus.PENDING_VERIFICATION);
    }

}
