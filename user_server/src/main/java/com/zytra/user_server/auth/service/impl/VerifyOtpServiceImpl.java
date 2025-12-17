package com.zytra.user_server.auth.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.zytra.user_server.auth.dto.request.VerifyOtpRequest;
import com.zytra.user_server.auth.dto.response.LoginResponse;
import com.zytra.user_server.auth.entity.OtpEntity;
import com.zytra.user_server.user.entity.UserEntity;
import com.zytra.user_server.enums.UserStatus;
import com.zytra.user_server.auth.exception.InvalidOtpException;
import com.zytra.user_server.auth.exception.InvalidUserException;
import com.zytra.user_server.auth.repository.OtpRepository;
import com.zytra.user_server.user.repository.UserRepository;
import com.zytra.user_server.auth.service.VerifyOtpService;
import com.zytra.user_server.util.OtpUtil;
import com.zytra.user_server.util.PasswordUtil;

import jakarta.transaction.Transactional;

import com.zytra.user_server.util.JwtUtil;

@Service

public class VerifyOtpServiceImpl implements VerifyOtpService {

    UserRepository userRepository;
    OtpRepository otpRepository;
    JwtUtil jwtUtil;

    public VerifyOtpServiceImpl(UserRepository userRepository, OtpRepository otpRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.jwtUtil = jwtUtil;
    }

    @Override
    @Transactional
    public LoginResponse verifyOtp(VerifyOtpRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new InvalidUserException("Invalid user");
        }

        // Fetch OTP entity to check expiry
        OtpEntity otpEntity = otpRepository.findOtpByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidOtpException("OTP not found"));

        // Check if OTP has expired
        if (LocalDateTime.now().isAfter(otpEntity.getExpiresAt())) {
            otpRepository.deleteByEmail(request.getEmail());
            throw new InvalidOtpException("OTP has expired. Please request a new OTP.");
        }

        String hashedotp = otpEntity.getOtpHash();

        boolean isValidOtp = OtpUtil.verifyOtp(request.getOtp(), hashedotp);

        if (!isValidOtp) {
            throw new InvalidOtpException("Invalid OTP");
        }

        // Delete OTP after successful verification
        otpRepository.deleteByEmail(request.getEmail());

        LocalDate dobDate = LocalDate.parse(request.getDob());
        LocalDateTime dob = dobDate.atStartOfDay();

        // Encrypt password before storing
        String encryptedPassword = PasswordUtil.encrypt(request.getPassword());

        UserEntity user = UserEntity.builder()
                .name(request.getName())
                .dob(dob)
                .phone(request.getPhone())
                .email(request.getEmail())
                .passwordHash(encryptedPassword)
                .status(UserStatus.ACTIVE)
                .build();

        userRepository.save(user);

        String accessToken = jwtUtil.generateAccessToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);
        long expiresIn = jwtUtil.getAccessTokenExpirySeconds();

        return new LoginResponse("Login successful", UserStatus.ACTIVE, user.getId(), accessToken, refreshToken,
                expiresIn);

    }

}
