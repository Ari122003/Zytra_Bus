package com.zytra.user_server.driver.dto;

import com.zytra.user_server.enums.DriverStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverDetailsResponse {
    private String message;
    private Long driverId;
    private String name;
    private String email;
    private String phone;
    private DriverStatus status;
    private Long assignedRouteId;
}
