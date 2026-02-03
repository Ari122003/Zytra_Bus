package com.zytra.user_server.config;

import com.zytra.user_server.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.List;

/**
 * WebSocket authentication interceptor that validates JWT tokens
 * before allowing WebSocket connections and subscriptions.
 */
@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private static final Logger log = LoggerFactory.getLogger(WebSocketAuthInterceptor.class);
    private final JwtUtil jwtUtil;

    public WebSocketAuthInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authToken = extractToken(accessor);

            if (authToken == null) {
                log.error("WebSocket connection attempt without authentication token");
                return null;
            }

            try {
                Claims claims = jwtUtil.validateAndParseClaims(authToken);
                Long userId = claims.get("userId", Long.class);
                String email = claims.getSubject();
                String role = claims.get("role", String.class);

                // Create a simple Principal with userId
                Principal principal = () -> String.valueOf(userId);
                accessor.setUser(principal);

            } catch (Exception e) {
                log.error("Invalid WebSocket authentication token: {}", e.getMessage());
                return null;
            }
        }

        return message;
    }

    /**
     * Extracts JWT token from WebSocket STOMP headers.
     * Supports both Authorization header and query parameter.
     */
    private String extractToken(StompHeaderAccessor accessor) {
        // Try Authorization header first
        List<String> authHeaders = accessor.getNativeHeader("Authorization");
        if (authHeaders != null && !authHeaders.isEmpty()) {
            String authHeader = authHeaders.get(0);
            if (authHeader.startsWith("Bearer ")) {
                return authHeader.substring(7);
            }
        }

        // Try token query parameter as fallback
        List<String> tokenParams = accessor.getNativeHeader("token");
        if (tokenParams != null && !tokenParams.isEmpty()) {
            return tokenParams.get(0);
        }

        return null;
    }
}
