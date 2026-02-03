package com.zytra.user_server.trips.service;

import java.util.List;

import com.zytra.user_server.seat.dto.SeatDTO;
import com.zytra.user_server.trips.dto.TripResponse;

public interface TripService {

    public TripResponse getTripDetails(Long tripId);

    public List<List<SeatDTO>> getSeatMatrix(Long tripId);

}
