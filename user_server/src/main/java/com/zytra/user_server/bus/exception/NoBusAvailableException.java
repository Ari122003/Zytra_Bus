package com.zytra.user_server.bus.exception;

public class NoBusAvailableException extends RuntimeException {
    public NoBusAvailableException(String message) {
        super(message);
    }
}
