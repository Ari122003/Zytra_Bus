package com.zytra.user_server.enums;

/**
 * Seat status in the database.
 * Note: AVAILABLE seats are NOT stored in DB - a missing record means
 * available.
 */
public enum SeatStatus {
    AVAILABLE, // Used only in DTOs for response, never persisted
    LOCKED, // Temporarily held during booking process
    BOOKED // Confirmed reservation
}
