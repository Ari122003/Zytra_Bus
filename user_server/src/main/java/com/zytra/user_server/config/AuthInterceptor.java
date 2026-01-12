package com.zytra.user_server.config;

import com.zytra.user_server.util.JwtUtil;
import com.zytra.user_server.enums.UserRole;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    public AuthInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("Missing or invalid Authorization header");
            return false;
        }

        String token = authHeader.substring(7);
        try {
            var claims = jwtUtil.validateAndParseClaims(token);
            String email = claims.getSubject();
            Long userId = claims.get("userId", Long.class);
            String roleStr = claims.get("role", String.class);

            if (roleStr == null) {
                response.setStatus(HttpStatus.FORBIDDEN.value());
                response.getWriter().write("Role information missing in token");
                return false;
            }

            UserRole userRole = UserRole.valueOf(roleStr);
            String requestPath = request.getRequestURI();

            // Check role-based access
            if (requestPath.startsWith("/user/") && userRole != UserRole.USER) {
                response.setStatus(HttpStatus.FORBIDDEN.value());
                response.getWriter().write("Access denied: User role required");
                return false;
            }

            if (requestPath.startsWith("/driver/") && userRole != UserRole.DRIVER) {
                response.setStatus(HttpStatus.FORBIDDEN.value());
                response.getWriter().write("Access denied: Driver role required");
                return false;
            }

            // Set authentication attributes
            request.setAttribute("authenticatedUser", email);
            request.setAttribute("authenticatedUserId", userId);
            request.setAttribute("authenticatedUserRole", userRole);
            return true;
        } catch (Exception ex) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("Invalid or expired token");
            return false;
        }
    }
}
