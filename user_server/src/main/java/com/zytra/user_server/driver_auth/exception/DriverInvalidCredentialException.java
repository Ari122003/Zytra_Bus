package com.zytra.user_server.driver_auth.exception;

public class DriverInvalidCredentialException extends RuntimeException {
    public DriverInvalidCredentialException(String message) {
        super(message);
    }
}
