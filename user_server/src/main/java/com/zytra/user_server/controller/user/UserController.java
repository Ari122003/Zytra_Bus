package com.zytra.user_server.controller.user;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zytra.user_server.dto.response.user.GetUserDetailsResponse;
import com.zytra.user_server.service.UserService;

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
}
