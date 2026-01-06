package com.zytra.user_server.bookings.exception;

public class InvalidSeatSelectionException extends RuntimeException {
    public InvalidSeatSelectionException(String message) {
        super(message);
    }
}
