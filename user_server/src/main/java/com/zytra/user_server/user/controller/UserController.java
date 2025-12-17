package com.zytra.user_server.user.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zytra.user_server.user.dto.request.UpdateInfoRequest;
import com.zytra.user_server.user.dto.request.UpdateUserImageRequest;
import com.zytra.user_server.user.dto.response.GetUserDetailsResponse;
import com.zytra.user_server.user.dto.response.UpdateInfoResponse;
import com.zytra.user_server.user.dto.response.UpdateUserImageResponse;
import com.zytra.user_server.user.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{userId}/details")
    public GetUserDetailsResponse getUserDetails(@PathVariable Long userId) {
        return userService.getUserDetails(userId);
    }

    @PutMapping(value = "/{userId}/update-image")
    public UpdateUserImageResponse updateUserImage(
            @PathVariable Long userId,
            @RequestBody @Valid UpdateUserImageRequest request) {

        return userService.updateUserImage(userId, request.getImageUrl());

    }

    @PutMapping("/{userId}/update-info")
    public UpdateInfoResponse updateUserInfo(
            @PathVariable Long userId,
            @RequestBody @Valid UpdateInfoRequest request) {
        return userService.updateUserInfo(userId, request);
    }
}
