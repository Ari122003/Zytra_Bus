package com.zytra.user_server.service.impl;

import org.springframework.stereotype.Service;

import com.zytra.user_server.dto.response.user.GetUserDetailsResponse;
import com.zytra.user_server.entity.UserEntity;
import com.zytra.user_server.enums.UserStatus;
import com.zytra.user_server.exception.UserNotFoundException;
import com.zytra.user_server.repository.UserRepository;
import com.zytra.user_server.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Get user information

    @Override
    public GetUserDetailsResponse getUserDetails(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UserNotFoundException("User account is not active");
        }

        return GetUserDetailsResponse.builder()
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .dob(user.getDob() != null ? user.getDob().toLocalDate().toString() : null)
                .build();
    }
}
