package com.zytra.user_server.bookings.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@AllArgsConstructor
@Builder
@Data
public class BookingResponse {

    private String message;
}
