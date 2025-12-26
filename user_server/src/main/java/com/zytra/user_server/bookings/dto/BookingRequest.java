package com.zytra.user_server.bookings.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data

public class BookingRequest {

    private long tripId;
    private long userId;
    private String[] seatNumbers;

}
