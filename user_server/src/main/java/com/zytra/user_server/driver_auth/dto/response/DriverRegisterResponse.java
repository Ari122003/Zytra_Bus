package com.zytra.user_server.driver_auth.dto.response;

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
    private Long driverId;
    private String email;
}
