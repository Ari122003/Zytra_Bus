package com.zytra.user_server.driver_auth.service.impl;

import com.zytra.user_server.driver_auth.dto.request.DriverRefreshTokenRequest;
import com.zytra.user_server.driver_auth.dto.response.DriverLoginResponse;
import com.zytra.user_server.driver_auth.entity.DriverRefreshTokenEntity;
import com.zytra.user_server.driver.entity.DriverEntity;
import com.zytra.user_server.driver_auth.exception.DriverInvalidCredentialException;
import com.zytra.user_server.driver_auth.repository.DriverRefreshTokenRepository;
import com.zytra.user_server.driver.repository.DriverRepository;
import com.zytra.user_server.driver_auth.service.DriverRefreshTokenService;
import com.zytra.user_server.util.JwtUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class DriverRefreshTokenServiceImpl implements DriverRefreshTokenService {

    private static final int REFRESH_TOKEN_EXPIRY_DAYS = 7;

    private final DriverRefreshTokenRepository driverRefreshTokenRepository;
    private final DriverRepository driverRepository;
    private final JwtUtil jwtUtil;

    public DriverRefreshTokenServiceImpl(DriverRefreshTokenRepository driverRefreshTokenRepository,
            DriverRepository driverRepository,
            JwtUtil jwtUtil) {
        this.driverRefreshTokenRepository = driverRefreshTokenRepository;
        this.driverRepository = driverRepository;
        this.jwtUtil = jwtUtil;
    }

    // ==================== Token Lifecycle Methods ====================

    @Override
    @Transactional
    public DriverRefreshTokenEntity createRefreshToken(DriverEntity driver, String token, String deviceInfo,
            String ipAddress) {
        return createRefreshToken(driver.getId(), token, deviceInfo, ipAddress);
    }

    @Override
    @Transactional
    public DriverRefreshTokenEntity createRefreshToken(Long driverId, String token, String deviceInfo,
            String ipAddress) {
        String tokenHash = hashToken(token);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiry = now.plusDays(REFRESH_TOKEN_EXPIRY_DAYS);

        DriverRefreshTokenEntity refreshToken = DriverRefreshTokenEntity.builder()
                .tokenHash(tokenHash)
                .driverId(driverId)
                .issuedAt(now)
                .expiresAt(expiry)
                .lastUsedAt(now)
                .revoked(false)
                .deviceInfo(deviceInfo)
                .ipAddress(ipAddress)
                .build();

        return driverRefreshTokenRepository.save(refreshToken);
    }

    @Override
    @Transactional
    public DriverRefreshTokenEntity validateRefreshToken(String token) {
        String tokenHash = hashToken(token);

        DriverRefreshTokenEntity refreshToken = driverRefreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new DriverInvalidCredentialException("Invalid refresh token"));

        validateTokenState(refreshToken);
        updateLastUsedTimestamp(refreshToken);

        return refreshToken;
    }

    @Override
    @Transactional
    public void revokeToken(String token) {
        String tokenHash = hashToken(token);
        driverRefreshTokenRepository.revokeByTokenHash(tokenHash);
    }

    @Override
    @Transactional
    public void revokeAllDriverTokens(Long driverId) {
        driverRefreshTokenRepository.revokeAllByDriverId(driverId);
    }

    @Override
    @Transactional
    public void cleanupExpiredTokens() {
        driverRefreshTokenRepository.deleteExpiredTokens(LocalDateTime.now());
    }

    // ==================== Business Logic Methods ====================

    @Override
    @Transactional
    public DriverLoginResponse refreshToken(DriverRefreshTokenRequest request) {
        DriverRefreshTokenEntity tokenEntity = validateRefreshToken(request.getRefreshToken());
        DriverEntity driver = getDriverById(tokenEntity.getDriverId());

        String newAccessToken = jwtUtil.generateAccessToken(driver);
        String newRefreshToken = jwtUtil.generateRefreshToken(driver);
        long expiresIn = jwtUtil.getAccessTokenExpirySeconds();

        rotateRefreshToken(request.getRefreshToken(), driver.getId(), newRefreshToken);

        return new DriverLoginResponse("Token refreshed successfully", driver.getStatus(), driver.getId(),
                newAccessToken, newRefreshToken, Long.valueOf(expiresIn));
    }

    @Override
    @Transactional
    public void logout(DriverRefreshTokenRequest request) {
        revokeToken(request.getRefreshToken());
    }

    // ==================== Private Helper Methods ====================

    private void validateTokenState(DriverRefreshTokenEntity refreshToken) {
        if (refreshToken.isRevoked()) {
            throw new DriverInvalidCredentialException("Refresh token has been revoked");
        }

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new DriverInvalidCredentialException("Refresh token has expired");
        }
    }

    private void updateLastUsedTimestamp(DriverRefreshTokenEntity refreshToken) {
        refreshToken.setLastUsedAt(LocalDateTime.now());
        driverRefreshTokenRepository.save(refreshToken);
    }

    private DriverEntity getDriverById(Long driverId) {
        return driverRepository.findById(driverId)
                .orElseThrow(() -> new DriverInvalidCredentialException("Driver not found"));
    }

    private void rotateRefreshToken(String oldToken, Long driverId, String newToken) {
        revokeToken(oldToken);
        createRefreshToken(driverId, newToken, null, null);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to hash token", e);
        }
    }
}
