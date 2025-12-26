package com.zytra.user_server.seat.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@AllArgsConstructor
@Data
@Builder

public class LockSeatsResponse {

    private String message;
    private String[] lockedSeats;
    private LocalDateTime lockExpiresAt;

}
