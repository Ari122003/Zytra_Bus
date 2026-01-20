package com.zytra.user_server.driver_auth.dto.response;

import com.zytra.user_server.enums.DriverStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverRegisterResponse {
    private String message;
    private DriverStatus status;
    private Long driverId;
    private String accessToken;
    private String refreshToken;
    private Long expiresIn;
}
