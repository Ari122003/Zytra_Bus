package com.zytra.user_server.auth.dto.response;

import com.zytra.user_server.enums.UserStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {
    private String message;
    private UserStatus status;
    private Long userId;
    private String accessToken;
    private String refreshToken;
    private Long expiresIn; // seconds

    public LoginResponse(String message, UserStatus status) {
        this.message = message;
        this.status = status;
    }

    public LoginResponse(String message, UserStatus status, Long userId, String accessToken, String refreshToken,
            Long expiresIn) {
        this.message = message;
        this.status = status;
        this.userId = userId;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
    }
}
