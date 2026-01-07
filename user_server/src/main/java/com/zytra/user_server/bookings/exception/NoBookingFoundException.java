package com.zytra.user_server.bookings.exception;

public class NoBookingFoundException extends RuntimeException {

    public NoBookingFoundException() {
        super();
    }

    public NoBookingFoundException(String message) {
        super(message);
    }

    public NoBookingFoundException(String message, Throwable cause) {
        super(message, cause);
    }

}
