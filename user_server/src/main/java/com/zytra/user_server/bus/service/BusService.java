package com.zytra.user_server.bus.service;

import java.time.LocalDate;
import java.time.LocalTime;

import com.zytra.user_server.bus.dto.SearchBusesResponse;

public interface BusService {

    public SearchBusesResponse searchBuses(String source, String destination, LocalDate travelDate,
            LocalTime currentTime);
}
