package com.zytra.user_server.bus.exception;

public class InvalidTravelDateException extends RuntimeException {
    public InvalidTravelDateException(String message) {
        super(message);
    }
}
