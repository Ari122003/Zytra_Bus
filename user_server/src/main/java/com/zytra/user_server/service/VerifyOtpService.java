package com.zytra.user_server.service;

import com.zytra.user_server.dto.request.auth.VerifyOtpRequest;
import com.zytra.user_server.dto.response.auth.LoginResponse;

public interface VerifyOtpService {
    public LoginResponse verifyOtp(VerifyOtpRequest request);
}
