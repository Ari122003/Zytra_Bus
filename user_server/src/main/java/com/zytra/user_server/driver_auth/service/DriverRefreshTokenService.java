package com.zytra.user_server.driver_auth.service;

import com.zytra.user_server.driver_auth.entity.DriverRefreshTokenEntity;
import com.zytra.user_server.driver.entity.DriverEntity;

public interface DriverRefreshTokenService {

    /**
     * Creates and persists a refresh token for the driver
     */
    DriverRefreshTokenEntity createRefreshToken(DriverEntity driver, String token, String deviceInfo, String ipAddress);

    /**
     * Creates and persists a refresh token for a driver ID
     */
    DriverRefreshTokenEntity createRefreshToken(Long driverId, String token, String deviceInfo, String ipAddress);

    /**
     * Validates and returns the refresh token entity (throws if
     * invalid/revoked/expired)
     */
    DriverRefreshTokenEntity validateRefreshToken(String token);

    /**
     * Revokes a specific refresh token
     */
    void revokeToken(String token);

    /**
     * Revokes all refresh tokens for a driver (e.g., on password change/logout all)
     */
    void revokeAllDriverTokens(Long driverId);

    /**
     * Cleanup expired tokens (can be scheduled)
     */
    void cleanupExpiredTokens();
}
