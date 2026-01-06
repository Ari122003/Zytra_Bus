package com.zytra.user_server.seat.exception;

public class SeatAlreadyLockedException extends RuntimeException {
    public SeatAlreadyLockedException(String message) {
        super(message);
    }
}
