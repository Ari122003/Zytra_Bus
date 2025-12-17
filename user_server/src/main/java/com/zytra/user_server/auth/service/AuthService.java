package com.zytra.user_server.auth.service;

import com.zytra.user_server.auth.dto.request.LoginRequest;
import com.zytra.user_server.auth.dto.response.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
}
