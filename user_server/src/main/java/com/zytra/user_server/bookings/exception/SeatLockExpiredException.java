package com.zytra.user_server.bookings.exception;

public class SeatLockExpiredException extends RuntimeException {
    public SeatLockExpiredException(String message) {
        super(message);
    }
}
