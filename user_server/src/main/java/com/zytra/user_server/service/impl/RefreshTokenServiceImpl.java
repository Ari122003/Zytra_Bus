package com.zytra.user_server.service.impl;

import com.zytra.user_server.entity.RefreshTokenEntity;
import com.zytra.user_server.entity.UserEntity;
import com.zytra.user_server.exception.InvalidCredentialException;
import com.zytra.user_server.repository.RefreshTokenRepository;
import com.zytra.user_server.service.RefreshTokenService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenServiceImpl(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Override
    @Transactional
    public RefreshTokenEntity createRefreshToken(UserEntity user, String token, String deviceInfo, String ipAddress) {
        String tokenHash = hashToken(token);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiry = now.plusDays(7);

        RefreshTokenEntity refreshToken = RefreshTokenEntity.builder()
                .tokenHash(tokenHash)
                .userId(user.getId())
                .issuedAt(now)
                .expiresAt(expiry)
                .lastUsedAt(now)
                .revoked(false)
                .deviceInfo(deviceInfo)
                .ipAddress(ipAddress)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    @Override
    @Transactional(readOnly = true)
    public RefreshTokenEntity validateRefreshToken(String token) {
        String tokenHash = hashToken(token);

        RefreshTokenEntity refreshToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidCredentialException("Invalid refresh token"));

        if (refreshToken.isRevoked()) {
            throw new InvalidCredentialException("Refresh token has been revoked");
        }

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidCredentialException("Refresh token has expired");
        }

        // Update last used timestamp
        refreshToken.setLastUsedAt(LocalDateTime.now());
        refreshTokenRepository.save(refreshToken);

        return refreshToken;
    }

    @Override
    @Transactional
    public void revokeToken(String token) {
        String tokenHash = hashToken(token);
        refreshTokenRepository.revokeByTokenHash(tokenHash);
    }

    @Override
    @Transactional
    public void revokeAllUserTokens(Long userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
    }

    @Override
    @Transactional
    public void cleanupExpiredTokens() {
        refreshTokenRepository.deleteExpiredTokens(LocalDateTime.now());
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
