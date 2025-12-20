package com.zytra.user_server.trips.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.zytra.user_server.trips.dto.TripResponse;
import com.zytra.user_server.trips.service.TripService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @GetMapping("/{tripId}")
    @ResponseStatus(HttpStatus.OK)
    public TripResponse getTrip(@PathVariable Long tripId) {
        return tripService.getTripDetails(tripId);
    }

}
