package com.zytra.user_server.user.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zytra.user_server.user.dto.request.UpdateInfoRequest;
import com.zytra.user_server.user.dto.response.GetUserDetailsResponse;
import com.zytra.user_server.user.dto.response.UpdateInfoResponse;
import com.zytra.user_server.user.dto.response.UpdateUserImageResponse;
import com.zytra.user_server.user.entity.UserEntity;
import com.zytra.user_server.enums.UserStatus;
import com.zytra.user_server.user.exception.UserNotFoundException;
import com.zytra.user_server.user.repository.UserRepository;
import com.zytra.user_server.user.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    // Get user information

    @Override
    @Transactional(readOnly = true)
    public GetUserDetailsResponse getUserDetails(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UserNotFoundException("User account is not active");
        }

        return GetUserDetailsResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .dob(user.getDob() != null ? user.getDob().toLocalDate().toString() : null)
                .imageUrl(user.getImageUrl())
                .build();
    }

    // update user image

    @Override
    @Transactional
    public UpdateUserImageResponse updateUserImage(Long userId, String imageUrl) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UserNotFoundException("User account is not active");
        }

        user.setImageUrl(imageUrl);
        userRepository.save(user);

        return UpdateUserImageResponse.builder()
                .message("User image updated successfully")
                .build();
    }

    // update user info (name and dob)

    @Override
    @Transactional
    public UpdateInfoResponse updateUserInfo(Long userId, UpdateInfoRequest request) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UserNotFoundException("User account is not active");
        }

        user.setName(request.getName());
        user.setDob(java.time.LocalDate.parse(request.getDob()).atStartOfDay());
        userRepository.save(user);

        return UpdateInfoResponse.builder()
                .message("User information updated successfully")
                .build();
    }
}
