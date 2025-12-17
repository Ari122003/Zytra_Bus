package com.zytra.user_server.user.service;

import com.zytra.user_server.user.dto.request.UpdateInfoRequest;
import com.zytra.user_server.user.dto.response.GetUserDetailsResponse;
import com.zytra.user_server.user.dto.response.UpdateInfoResponse;
import com.zytra.user_server.user.dto.response.UpdateUserImageResponse;

public interface UserService {
    public GetUserDetailsResponse getUserDetails(Long userId);

    public UpdateUserImageResponse updateUserImage(Long userId, String imageUrl);

    public UpdateInfoResponse updateUserInfo(Long userId, UpdateInfoRequest request);
}
