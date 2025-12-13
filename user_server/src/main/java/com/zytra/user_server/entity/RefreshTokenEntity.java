package com.zytra.user_server.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens", indexes = {
        @Index(name = "idx_refresh_tokens_token_hash", columnList = "tokenHash"),
        @Index(name = "idx_refresh_tokens_user_id", columnList = "userId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshTokenEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String tokenHash;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private LocalDateTime issuedAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private LocalDateTime lastUsedAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean revoked = false;

    private String deviceInfo; // Optional: user agent, device fingerprint

    private String ipAddress; // Optional: IP for security tracking

    @PrePersist
    protected void onCreate() {
        if (issuedAt == null) {
            issuedAt = LocalDateTime.now();
        }
    }
}
