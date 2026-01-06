package com.zytra.user_server.seat.exception;

public class NoSeatsSpecifiedException extends RuntimeException {
    public NoSeatsSpecifiedException(String message) {
        super(message);
    }
}
