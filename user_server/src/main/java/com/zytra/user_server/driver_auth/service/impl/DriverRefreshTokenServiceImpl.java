package com.zytra.user_server.driver_auth.service.impl;

import com.zytra.user_server.driver_auth.entity.DriverRefreshTokenEntity;
import com.zytra.user_server.driver.entity.DriverEntity;
import com.zytra.user_server.auth.exception.InvalidCredentialException;
import com.zytra.user_server.driver_auth.repository.DriverRefreshTokenRepository;
import com.zytra.user_server.driver_auth.service.DriverRefreshTokenService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class DriverRefreshTokenServiceImpl implements DriverRefreshTokenService {

    private final DriverRefreshTokenRepository driverRefreshTokenRepository;

    public DriverRefreshTokenServiceImpl(DriverRefreshTokenRepository driverRefreshTokenRepository) {
        this.driverRefreshTokenRepository = driverRefreshTokenRepository;
    }

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
        LocalDateTime expiry = now.plusDays(7);

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
    @Transactional(readOnly = true)
    public DriverRefreshTokenEntity validateRefreshToken(String token) {
        String tokenHash = hashToken(token);

        DriverRefreshTokenEntity refreshToken = driverRefreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidCredentialException("Invalid refresh token"));

        if (refreshToken.isRevoked()) {
            throw new InvalidCredentialException("Refresh token has been revoked");
        }

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidCredentialException("Refresh token has expired");
        }

        // Update last used timestamp
        refreshToken.setLastUsedAt(LocalDateTime.now());
        driverRefreshTokenRepository.save(refreshToken);

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
