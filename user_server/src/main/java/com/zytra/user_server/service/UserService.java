package com.zytra.user_server.service;

import com.zytra.user_server.dto.response.user.GetUserDetailsResponse;

public interface UserService {
    public GetUserDetailsResponse getUserDetails(Long userId);
}
