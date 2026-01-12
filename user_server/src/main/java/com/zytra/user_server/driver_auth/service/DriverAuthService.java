package com.zytra.user_server.driver_auth.service;

import com.zytra.user_server.driver_auth.dto.request.DriverLoginRequest;
import com.zytra.user_server.driver_auth.dto.request.DriverRegisterRequest;
import com.zytra.user_server.driver_auth.dto.response.DriverLoginResponse;
import com.zytra.user_server.driver_auth.dto.response.DriverRegisterResponse;

public interface DriverAuthService {
    DriverLoginResponse login(DriverLoginRequest request);

    DriverRegisterResponse register(DriverRegisterRequest request);
}
