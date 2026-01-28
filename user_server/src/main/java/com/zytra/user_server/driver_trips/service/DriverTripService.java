package com.zytra.user_server.driver_trips.service;

import com.zytra.user_server.driver_trips.dto.responses.GetCurrentTripResponse;
import com.zytra.user_server.driver_trips.dto.responses.GetUpcomingTripsResponse;

public interface DriverTripService {
    public GetCurrentTripResponse getCurrentTrip(Long driverId);

    public void verifyTicket(Long bookingId);

    public GetUpcomingTripsResponse getUpcomingTrips(Long driverId);
}
