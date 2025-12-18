package com.zytra.user_server.bus.service.implementation;

import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.zytra.user_server.bus.dto.SearchBusesResponse;
import com.zytra.user_server.bus.entity.BusEntity;
import com.zytra.user_server.bus.repository.BusRepository;
import com.zytra.user_server.bus.service.BusService;
import com.zytra.user_server.routes.entity.RouteEntity;
import com.zytra.user_server.routes.repository.RouteRepository;
import com.zytra.user_server.schedule.entity.ScheduleEntity;
import com.zytra.user_server.schedule.repository.ScheduleRepository;

@Service
public class BusServiceImpl implements BusService {

    RouteRepository routeRepository;
    ScheduleRepository scheduleRepository;
    BusRepository busRepository;

    public BusServiceImpl(RouteRepository routeRepository, ScheduleRepository scheduleRepository,
            BusRepository busRepository) {
        this.routeRepository = routeRepository;
        this.scheduleRepository = scheduleRepository;
        this.busRepository = busRepository;
    }

    @Value("${booking.window.days}")
    private int bookingWindowDays;

    @Override
    public SearchBusesResponse searchBuses(String source, String destination, LocalDate travelDate,
            LocalTime currentTime) {

        if (travelDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Travel date cannot be in the past");
        }

        if (travelDate.isAfter(LocalDate.now().plusDays(bookingWindowDays))) {
            throw new IllegalArgumentException("Book before " + bookingWindowDays + " days");
        }

        RouteEntity route = routeRepository.findBySourceAndDestination(source, destination)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No route found from " + source + " to " + destination));

        ScheduleEntity schedule = scheduleRepository.findByRoute(route)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No bus found for route from " + source + " to " + destination));

        BusEntity bus = busRepository.findById(schedule.getBus().getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No bus found for route from " + source + " to " + destination));

        return null;
    }

}
