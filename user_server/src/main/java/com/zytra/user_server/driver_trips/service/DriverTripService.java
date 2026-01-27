package com.zytra.user_server.driver_trips.service;

import com.zytra.user_server.driver_trips.dto.responses.GetCurrentTripResponse;

public interface DriverTripService {
    public GetCurrentTripResponse getCurrentTrip(Long driverId);

    public void verifyTicket(Long bookingId);
}
