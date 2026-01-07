package com.zytra.user_server.bookings.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class GetBookingResponse {

    private List<BookingDetails> bookings;
}
