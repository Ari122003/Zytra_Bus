package com.zytra.user_server.bookings.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data

public class BookingRequest {

    private long tripId;
    private long userId;
    private BigDecimal amount;
    private String[] seatNumbers;

}
