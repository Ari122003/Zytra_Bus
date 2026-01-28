package com.zytra.user_server.driver_auth.repository;

import com.zytra.user_server.driver_auth.entity.DriverRefreshTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface DriverRefreshTokenRepository extends JpaRepository<DriverRefreshTokenEntity, Long> {

    Optional<DriverRefreshTokenEntity> findByTokenHash(String tokenHash);

    /**
     * Revokes refresh token by setting revoked flag to true for the given token
     * hash
     */
    @Modifying
    @Query("UPDATE DriverRefreshTokenEntity rt SET rt.revoked = true WHERE rt.tokenHash = :tokenHash")
    void revokeByTokenHash(@Param("tokenHash") String tokenHash);

    /**
     * Revokes all refresh tokens for a driver by setting revoked flag to true
     */
    @Modifying
    @Query("UPDATE DriverRefreshTokenEntity rt SET rt.revoked = true WHERE rt.driverId = :driverId")
    void revokeAllByDriverId(@Param("driverId") Long driverId);

    /**
     * Deletes expired refresh tokens where expiration time has passed
     */
    @Modifying
    @Query("DELETE FROM DriverRefreshTokenEntity rt WHERE rt.expiresAt < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);

}
