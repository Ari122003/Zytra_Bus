package com.zytra.user_server.trips.exception;

public class TripCancelledException extends RuntimeException {
    public TripCancelledException(String message) {
        super(message);
    }
}
