package com.zytra.user_server.trips.service;

import com.zytra.user_server.trips.dto.TripResponse;

public interface TripService {

    public TripResponse getTripDetails(Long tripId);

}
