package com.zytra.user_server.seat.exception;

public class LockOwnerRequiredException extends RuntimeException {
    public LockOwnerRequiredException(String message) {
        super(message);
    }
}
