package com.zytra.user_server.driver_trips.dto.responses;

import java.time.LocalTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@AllArgsConstructor
@Data
@Builder
public class GetCurrentTripResponse {
    private Long tripId;
    private Long driverId;
    private String busNumber;
    private String startLocation;
    private String endLocation;
    private LocalTime startTime;
    private LocalTime estimatedEndTime;
    private int passengerCount;
    private List<BookingDTO> bookings;

}
