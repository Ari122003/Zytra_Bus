package com.zytra.user_server.trips.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Event published when seat matrix is updated.
 * Handled after transaction commit to ensure data consistency.
 */
@Getter
public class SeatMatrixUpdateEvent extends ApplicationEvent {
    private final Long tripId;

    public SeatMatrixUpdateEvent(Object source, Long tripId) {
        super(source);
        this.tripId = tripId;
    }
}
