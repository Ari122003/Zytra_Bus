package com.zytra.user_server.driver_trips.dto.responses;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GetUpcomingTripsResponse {
    private Long driverId;
    private List<UpcomingTripDTO> upcomingTrips;
}
