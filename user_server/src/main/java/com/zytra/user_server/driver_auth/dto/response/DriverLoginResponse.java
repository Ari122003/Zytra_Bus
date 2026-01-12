package com.zytra.user_server.driver_auth.dto.response;

import com.zytra.user_server.enums.DriverStatus;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DriverLoginResponse {
    private String message;
    private DriverStatus status;
    private Long driverId;
    private String accessToken;
    private String refreshToken;
    private Long expiresIn; // seconds

    public DriverLoginResponse(String message, DriverStatus status) {
        this.message = message;
        this.status = status;
    }

    public DriverLoginResponse(String message, DriverStatus status, Long driverId, String accessToken,
            String refreshToken, Long expiresIn) {
        this.message = message;
        this.status = status;
        this.driverId = driverId;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
    }
}
