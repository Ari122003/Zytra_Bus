package com.zytra.user_server.service;

import com.zytra.user_server.dto.request.auth.LoginRequest;
import com.zytra.user_server.dto.response.auth.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
}
