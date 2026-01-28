package com.zytra.user_server.driver_trips.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zytra.user_server.driver_trips.dto.responses.GetCurrentTripResponse;
import com.zytra.user_server.driver_trips.dto.responses.GetUpcomingTripsResponse;
import com.zytra.user_server.driver_trips.dto.responses.MessageResponse;
import com.zytra.user_server.driver_trips.service.DriverTripService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/driver")
public class DriverTripsController {

    private final DriverTripService driverTripService;

    @GetMapping("/current-trip/{driverId}")
    public ResponseEntity<GetCurrentTripResponse> CurentTripController(@PathVariable Long driverId) {
        return ResponseEntity.ok(driverTripService.getCurrentTrip(driverId));
    }

    @GetMapping("/upcoming-trips/{driverId}")
    public ResponseEntity<GetUpcomingTripsResponse> getUpcomingTrips(@PathVariable Long driverId) {
        return ResponseEntity.ok(driverTripService.getUpcomingTrips(driverId));
    }

    @PatchMapping("/verify-ticket/{bookingId}")
    public ResponseEntity<MessageResponse> verifyTicket(@PathVariable Long bookingId) {
        driverTripService.verifyTicket(bookingId);
        return ResponseEntity.ok(MessageResponse.builder()
                .message("Ticket verified successfully")
                .build());
    }

}
