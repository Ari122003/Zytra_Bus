package com.zytra.user_server.auth.service;

import com.zytra.user_server.auth.dto.request.VerifyOtpRequest;
import com.zytra.user_server.auth.dto.response.LoginResponse;

public interface VerifyOtpService {
    public LoginResponse verifyOtp(VerifyOtpRequest request);
}
