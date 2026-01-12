package com.zytra.user_server.driver.service;

import com.zytra.user_server.driver.dto.UpdateDriverRequest;
import com.zytra.user_server.driver.dto.DriverDetailsResponse;

public interface DriverService {
    DriverDetailsResponse getDriverDetails(Long driverId);

    DriverDetailsResponse updateDriverInfo(Long driverId, UpdateDriverRequest request);
}
