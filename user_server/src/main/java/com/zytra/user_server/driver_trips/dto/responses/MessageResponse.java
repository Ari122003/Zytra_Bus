package com.zytra.user_server.driver_trips.dto.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@AllArgsConstructor
@Data
@Builder
public class MessageResponse {
    private String message;
}
