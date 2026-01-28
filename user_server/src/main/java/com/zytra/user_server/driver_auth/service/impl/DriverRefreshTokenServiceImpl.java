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

    /**
     * Creates a refresh token for a driver entity.
     * Delegates to createRefreshToken(Long driverId, ...) using the driver's ID.
     * 
     * @param driver     the driver entity
     * @param token      the refresh token string
     * @param deviceInfo device information for tracking
     * @param ipAddress  IP address for tracking
     * @return the created DriverRefreshTokenEntity
     */
    @Override
    @Transactional
    public DriverRefreshTokenEntity createRefreshToken(DriverEntity driver, String token, String deviceInfo,
            String ipAddress) {
        return createRefreshToken(driver.getId(), token, deviceInfo, ipAddress);
    }

    /**
     * Creates a refresh token for a driver by driver ID.
     * Hashes the token, sets expiry to 7 days from now, and persists the token
     * entity.
     * 
     * @param driverId   the ID of the driver
     * @param token      the refresh token string to hash and store
     * @param deviceInfo device information for tracking
     * @param ipAddress  IP address for tracking
     * @return the created DriverRefreshTokenEntity
     */
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

    /**
     * Validates a driver refresh token by checking its hash, revocation status, and
     * expiry.
     * Updates the last used timestamp if validation succeeds.
     * 
     * @param token the refresh token string to validate
     * @return the validated DriverRefreshTokenEntity
     * @throws DriverInvalidCredentialException if token is invalid, revoked, or
     *                                          expired
     */
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

    /**
     * Revokes a specific driver refresh token by its hash.
     * Marks the token as unusable for future authentication.
     * 
     * @param token the refresh token string to revoke
     */
    @Override
    @Transactional
    public void revokeToken(String token) {
        String tokenHash = hashToken(token);
        driverRefreshTokenRepository.revokeByTokenHash(tokenHash);
    }

    /**
     * Revokes all refresh tokens for a specific driver.
     * Used for logout all devices or security purposes.
     * 
     * @param driverId the ID of the driver whose tokens should be revoked
     */
    @Override
    @Transactional
    public void revokeAllDriverTokens(Long driverId) {
        driverRefreshTokenRepository.revokeAllByDriverId(driverId);
    }

    /**
     * Removes all expired driver refresh tokens from the database.
     * Should be run periodically as a cleanup task to maintain database hygiene.
     */
    @Override
    @Transactional
    public void cleanupExpiredTokens() {
        driverRefreshTokenRepository.deleteExpiredTokens(LocalDateTime.now());
    }

    /**
     * Refreshes an expired access token using a valid refresh token.
     * Validates the refresh token, fetches driver details, generates new access and
     * refresh tokens,
     * and rotates the refresh token for security.
     * 
     * @param request the DriverRefreshTokenRequest containing the refresh token
     * @return DriverLoginResponse with new access and refresh tokens
     * @throws DriverInvalidCredentialException if token is invalid or driver not
     *                                          found
     */
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

    /**
     * Logs out a driver by revoking their refresh token.
     * Invalidates the current session and prevents token reuse.
     * 
     * @param request the DriverRefreshTokenRequest containing the refresh token to
     *                revoke
     */
    @Override
    @Transactional
    public void logout(DriverRefreshTokenRequest request) {
        revokeToken(request.getRefreshToken());
    }

    /**
     * Validates the state of a driver refresh token.
     * Checks if token is revoked or expired and throws exceptions accordingly.
     * 
     * @param refreshToken the token entity to validate
     * @throws DriverInvalidCredentialException if token is revoked or expired
     */
    private void validateTokenState(DriverRefreshTokenEntity refreshToken) {
        if (refreshToken.isRevoked()) {
            throw new DriverInvalidCredentialException("Refresh token has been revoked");
        }

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new DriverInvalidCredentialException("Refresh token has expired");
        }
    }

    /**
     * Updates the last used timestamp of a driver refresh token.
     * Tracks token usage for security monitoring and analytics.
     * 
     * @param refreshToken the token entity to update
     */
    private void updateLastUsedTimestamp(DriverRefreshTokenEntity refreshToken) {
        refreshToken.setLastUsedAt(LocalDateTime.now());
        driverRefreshTokenRepository.save(refreshToken);
    }

    /**
     * Retrieves a driver entity by ID.
     * Helper method for token refresh operations.
     * 
     * @param driverId the ID of the driver
     * @return the DriverEntity
     * @throws DriverInvalidCredentialException if driver is not found
     */
    private DriverEntity getDriverById(Long driverId) {
        return driverRepository.findById(driverId)
                .orElseThrow(() -> new DriverInvalidCredentialException("Driver not found"));
    }

    /**
     * Rotates a refresh token by revoking the old token and creating a new one.
     * Implements token rotation security best practice.
     * 
     * @param oldToken the old refresh token to revoke
     * @param driverId the ID of the driver
     * @param newToken the new refresh token to create
     */
    private void rotateRefreshToken(String oldToken, Long driverId, String newToken) {
        revokeToken(oldToken);
        createRefreshToken(driverId, newToken, null, null);
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
