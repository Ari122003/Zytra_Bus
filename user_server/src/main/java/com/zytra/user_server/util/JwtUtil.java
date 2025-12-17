package com.zytra.user_server.util;

import com.zytra.user_server.user.entity.UserEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.access.token.expiration-minutes:15}")
    private long accessTokenMinutes;

    @Value("${jwt.refresh.token.expiration-days:7}")
    private long refreshTokenDays;

    private SecretKey getSigningKey(byte[] salt) {
        try {
            // derive 256-bit key from secret (and optional salt)
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(jwtSecret.getBytes(StandardCharsets.UTF_8));
            if (salt != null)
                md.update(salt);
            byte[] keyBytes = md.digest();
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create signing key", e);
        }
    }

    public String generateAccessToken(UserEntity user) {
        Instant now = Instant.now();
        Instant expiry = now.plus(accessTokenMinutes, ChronoUnit.MINUTES);
        SecretKey key = getSigningKey(null);

        return Jwts.builder()
                .setSubject(user.getEmail())
                .setId(UUID.randomUUID().toString())
                .claim("userId", user.getId())
                .claim("status", user.getStatus().name())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiry))
                .setIssuer("zytra-user-server")
                .setAudience("zytra-api")
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(UserEntity user) {
        Instant now = Instant.now();
        Instant expiry = now.plus(refreshTokenDays, ChronoUnit.DAYS);
        SecretKey key = getSigningKey(null);

        return Jwts.builder()
                .setSubject(user.getEmail())
                .setId(UUID.randomUUID().toString())
                .claim("userId", user.getId())
                .claim("type", "refresh")
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiry))
                .setIssuer("zytra-user-server")
                .setAudience("zytra-api")
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public long getAccessTokenExpirySeconds() {
        return accessTokenMinutes * 60L;
    }

    /**
     * Validates and parses JWT token. Throws JwtException if invalid/expired.
     */
    public Claims validateAndParseClaims(String token) {
        SecretKey key = getSigningKey(null);
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .requireIssuer("zytra-user-server")
                .requireAudience("zytra-api")
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Extracts email (subject) from token without full validation (for quick
     * lookups)
     */
    public String getEmailFromToken(String token) {
        try {
            return validateAndParseClaims(token).getSubject();
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract email from token", e);
        }
    }

    /**
     * Extracts userId from token
     */
    public Long getUserIdFromToken(String token) {
        try {
            Claims claims = validateAndParseClaims(token);
            return claims.get("userId", Long.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract userId from token", e);
        }
    }
}
