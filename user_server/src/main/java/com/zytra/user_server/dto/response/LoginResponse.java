package com.zytra.user_server.dto.response;

import com.zytra.user_server.enums.UserStatus;

import lombok.Getter;

@Getter
public class LoginResponse {
    private String message;
    private UserStatus status;
    private String accessToken;
    private String refreshToken;
    private Long expiresIn; // seconds

    public LoginResponse(String message, UserStatus status) {
        this.message = message;
        this.status = status;
    }

    public LoginResponse(String message, UserStatus status, String accessToken, String refreshToken, Long expiresIn) {
        this.message = message;
        this.status = status;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
    }
}
