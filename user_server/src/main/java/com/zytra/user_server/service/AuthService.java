package com.zytra.user_server.service;

import com.zytra.user_server.dto.request.LoginRequest;
import com.zytra.user_server.dto.response.OtpSentResponse;

public interface AuthService {
    OtpSentResponse sendOtp(LoginRequest request);
}
