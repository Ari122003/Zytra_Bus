package com.zytra.user_server.bus.controller;

import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.zytra.user_server.bus.dto.SearchBusesResponse;
import com.zytra.user_server.bus.service.BusService;

@RestController
@RequestMapping("/buses")
public class BusController {

    BusService busService;

    public BusController(BusService busService) {
        this.busService = busService;
    }

    @GetMapping("/search")
    public SearchBusesResponse searchBuses(
            @RequestParam String source,
            @RequestParam String destination,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate travelDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime currentTime) {

        if (currentTime == null) {
            currentTime = LocalTime.now();
        }

        return busService.searchBuses(source, destination, travelDate, currentTime);
    }

}
