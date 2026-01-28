package com.zytra.user_server.auth.service.impl;

import com.zytra.user_server.auth.entity.RefreshTokenEntity;
import com.zytra.user_server.user.entity.UserEntity;
import com.zytra.user_server.auth.exception.InvalidCredentialException;
import com.zytra.user_server.auth.repository.RefreshTokenRepository;
import com.zytra.user_server.auth.service.RefreshTokenService;
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

    /**
     * Creates a refresh token for a user entity.
     * Delegates to createRefreshToken(Long userId, ...) using the user's ID.
     * 
     * @param user       the user entity
     * @param token      the refresh token string
     * @param deviceInfo device information for tracking
     * @param ipAddress  IP address for tracking
     * @return the created RefreshTokenEntity
     */
    @Override
    @Transactional
    public RefreshTokenEntity createRefreshToken(UserEntity user, String token, String deviceInfo, String ipAddress) {
        return createRefreshToken(user.getId(), token, deviceInfo, ipAddress);
    }

    /**
     * Creates a refresh token for a user by user ID.
     * Hashes the token, sets expiry to 7 days from now, and persists the token
     * entity.
     * 
     * @param userId     the ID of the user
     * @param token      the refresh token string to hash and store
     * @param deviceInfo device information for tracking
     * @param ipAddress  IP address for tracking
     * @return the created RefreshTokenEntity
     */
    @Override
    @Transactional
    public RefreshTokenEntity createRefreshToken(Long userId, String token, String deviceInfo, String ipAddress) {
        String tokenHash = hashToken(token);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiry = now.plusDays(7);

        RefreshTokenEntity refreshToken = RefreshTokenEntity.builder()
                .tokenHash(tokenHash)
                .userId(userId)
                .issuedAt(now)
                .expiresAt(expiry)
                .lastUsedAt(now)
                .revoked(false)
                .deviceInfo(deviceInfo)
                .ipAddress(ipAddress)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    /**
     * Validates a refresh token by checking its hash, revocation status, and
     * expiry.
     * Updates the last used timestamp if validation succeeds.
     * 
     * @param token the refresh token string to validate
     * @return the validated RefreshTokenEntity
     * @throws InvalidCredentialException if token is invalid, revoked, or expired
     */
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

        refreshToken.setLastUsedAt(LocalDateTime.now());
        refreshTokenRepository.save(refreshToken);

        return refreshToken;
    }

    /**
     * Revokes a specific refresh token by its hash.
     * Marks the token as unusable for future authentication.
     * 
     * @param token the refresh token string to revoke
     */
    @Override
    @Transactional
    public void revokeToken(String token) {
        String tokenHash = hashToken(token);
        refreshTokenRepository.revokeByTokenHash(tokenHash);
    }

    /**
     * Revokes all refresh tokens for a specific user.
     * Used for logout all devices or security purposes.
     * 
     * @param userId the ID of the user whose tokens should be revoked
     */
    @Override
    @Transactional
    public void revokeAllUserTokens(Long userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
    }

    /**
     * Removes all expired refresh tokens from the database.
     * Should be run periodically as a cleanup task to maintain database hygiene.
     */
    @Override
    @Transactional
    public void cleanupExpiredTokens() {
        refreshTokenRepository.deleteExpiredTokens(LocalDateTime.now());
    }

    /**
     * Hashes a token string using SHA-256 algorithm.
     * Provides security by storing hashed tokens instead of plaintext.
     * 
     * @param token the token string to hash
     * @return Base64-encoded hash of the token
     * @throws RuntimeException if hashing fails
     */
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
