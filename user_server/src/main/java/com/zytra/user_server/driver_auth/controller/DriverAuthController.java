package com.zytra.user_server.driver_auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zytra.user_server.driver_auth.dto.request.DriverRefreshTokenRequest;
import com.zytra.user_server.driver_auth.dto.request.DriverLoginRequest;
import com.zytra.user_server.driver_auth.dto.request.DriverRegisterRequest;
import com.zytra.user_server.driver_auth.dto.response.DriverLoginResponse;
import com.zytra.user_server.driver_auth.dto.response.DriverRegisterResponse;
import com.zytra.user_server.driver_auth.service.DriverAuthService;
import com.zytra.user_server.driver_auth.service.DriverRefreshTokenService;

import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/driver")
public class DriverAuthController {

    private final DriverAuthService driverAuthService;
    private final DriverRefreshTokenService driverRefreshTokenService;

    public DriverAuthController(DriverAuthService driverAuthService,
            DriverRefreshTokenService driverRefreshTokenService) {
        this.driverAuthService = driverAuthService;
        this.driverRefreshTokenService = driverRefreshTokenService;
    }

    @PostMapping("/auth/register")
    public DriverRegisterResponse driverRegisterController(@RequestBody @Valid DriverRegisterRequest request) {
        return driverAuthService.register(request);
    }

    @PostMapping("/auth/login")
    public DriverLoginResponse driverLoginController(@RequestBody @Valid DriverLoginRequest request) {
        return driverAuthService.login(request);
    }

    @PostMapping("/auth/refresh")
    public DriverLoginResponse driverRefreshTokenController(@RequestBody @Valid DriverRefreshTokenRequest request) {
        return driverRefreshTokenService.refreshToken(request);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> driverLogoutController(
            @RequestBody @Valid DriverRefreshTokenRequest request) {
        driverRefreshTokenService.logout(request);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout successful");
        return ResponseEntity.ok(response);
    }
}
