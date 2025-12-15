package com.zytra.user_server.dto.response.user;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateInfoResponse {

    private String message;

    private LocalDateTime updatedAt;

}
