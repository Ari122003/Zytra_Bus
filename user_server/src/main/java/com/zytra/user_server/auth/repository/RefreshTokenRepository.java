package com.zytra.user_server.auth.repository;

import com.zytra.user_server.auth.entity.RefreshTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshTokenEntity, Long> {

    Optional<RefreshTokenEntity> findByTokenHash(String tokenHash);

    /**
     * Revokes all refresh tokens for a user by setting revoked flag to true
     */
    @Modifying
    @Query("UPDATE RefreshTokenEntity rt SET rt.revoked = true WHERE rt.userId = :userId")
    void revokeAllByUserId(@Param("userId") Long userId);

    /**
     * Deletes expired refresh tokens where expiration time has passed
     */
    @Modifying
    @Query("DELETE FROM RefreshTokenEntity rt WHERE rt.expiresAt < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);

    /**
     * Revokes refresh token by setting revoked flag to true for the given token
     * hash
     */
    @Modifying
    @Query("UPDATE RefreshTokenEntity rt SET rt.revoked = true WHERE rt.tokenHash = :tokenHash")
    void revokeByTokenHash(@Param("tokenHash") String tokenHash);

}
