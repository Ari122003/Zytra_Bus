package com.zytra.user_server.seat.service;

import com.zytra.user_server.seat.dto.LockSeatsResponse;

public interface SeatService {
    LockSeatsResponse lockSeats(long tripId, String[] seats, Long lockOwner);

}
