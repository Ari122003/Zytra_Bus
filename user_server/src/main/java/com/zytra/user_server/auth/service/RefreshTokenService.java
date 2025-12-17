package com.zytra.user_server.auth.service;

import com.zytra.user_server.auth.entity.RefreshTokenEntity;
import com.zytra.user_server.user.entity.UserEntity;

public interface RefreshTokenService {

    /**
     * Creates and persists a refresh token for the user
     */
    RefreshTokenEntity createRefreshToken(UserEntity user, String token, String deviceInfo, String ipAddress);

    /**
     * Validates and returns the refresh token entity (throws if
     * invalid/revoked/expired)
     */
    RefreshTokenEntity validateRefreshToken(String token);

    /**
     * Revokes a specific refresh token
     */
    void revokeToken(String token);

    /**
     * Revokes all refresh tokens for a user (e.g., on password change/logout all)
     */
    void revokeAllUserTokens(Long userId);

    /**
     * Cleanup expired tokens (can be scheduled)
     */
    void cleanupExpiredTokens();
}
