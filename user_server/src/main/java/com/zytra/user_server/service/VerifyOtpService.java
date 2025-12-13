package com.zytra.user_server.service;

import com.zytra.user_server.dto.request.VerifyOtpRequest;
import com.zytra.user_server.dto.response.LoginResponse;

public interface VerifyOtpService {
    public LoginResponse verifyOtp(VerifyOtpRequest request);
}
