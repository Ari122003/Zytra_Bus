package com.zytra.user_server.controller.auth;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zytra.user_server.dto.request.LoginRequest;
import com.zytra.user_server.dto.response.OtpSentResponse;
import com.zytra.user_server.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")

public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/send-otp")
    public OtpSentResponse sendOtpEndPoint(@RequestBody @Valid LoginRequest request) {
        return authService.sendOtp(request);
    }
}
