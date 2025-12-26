package com.zytra.user_server.seat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data

public class LockSeatsRequest {

    private Long tripId;
    private String[] seats;
    private Long lockOwner;

}
