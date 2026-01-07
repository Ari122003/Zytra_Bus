package com.zytra.user_server.bookings.service;

import java.math.BigDecimal;

import com.zytra.user_server.bookings.dto.BookingResponse;
import com.zytra.user_server.bookings.dto.GetBookingResponse;

public interface BookingService {

    public BookingResponse processBooking(Long tripId, Long userId, String[] seatNumbers, BigDecimal amount);

    public GetBookingResponse getBookingsForUser(Long userId);

}
