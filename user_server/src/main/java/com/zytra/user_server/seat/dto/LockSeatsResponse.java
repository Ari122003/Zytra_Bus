package com.zytra.user_server.seat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data

public class LockSeatsResponse {

    private String message;
    private String[] lockedSeats;

}
