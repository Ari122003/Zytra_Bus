package com.zytra.user_server.service;

import com.zytra.user_server.dto.request.LoginRequest;
import com.zytra.user_server.dto.response.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
}
