package com.zytra.user_server.driver_auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data

public class DriverRefreshTokenRequest {

    @NotBlank(message = "Refresh token is required")
    private String refreshToken;

}
