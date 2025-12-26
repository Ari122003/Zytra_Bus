package com.zytra.user_server.bus.service.implementation;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zytra.user_server.bus.dto.SearchBusesResponse;
import com.zytra.user_server.bus.entity.BusEntity;
import com.zytra.user_server.bus.exception.InvalidTravelDateException;
import com.zytra.user_server.bus.exception.NoBusAvailableException;
import com.zytra.user_server.bus.exception.RouteNotFoundException;
import com.zytra.user_server.bus.repository.BusRepository;
import com.zytra.user_server.bus.service.BusService;
import com.zytra.user_server.enums.ScheduleStatus;
import com.zytra.user_server.enums.TripStatus;
import com.zytra.user_server.routes.entity.RouteEntity;
import com.zytra.user_server.routes.repository.RouteRepository;
import com.zytra.user_server.schedule.entity.ScheduleEntity;
import com.zytra.user_server.schedule.repository.ScheduleRepository;
import com.zytra.user_server.trips.entity.TripEntity;
import com.zytra.user_server.trips.repository.TripRepository;
import com.zytra.user_server.trips.service.TripCreationService;

@Service
public class BusServiceImpl implements BusService {

    RouteRepository routeRepository;
    ScheduleRepository scheduleRepository;
    BusRepository busRepository;
    TripRepository tripRepository;
    TripCreationService tripCreationService;

    public BusServiceImpl(RouteRepository routeRepository, ScheduleRepository scheduleRepository,
            BusRepository busRepository, TripRepository tripRepository, TripCreationService tripCreationService) {
        this.routeRepository = routeRepository;
        this.scheduleRepository = scheduleRepository;
        this.busRepository = busRepository;
        this.tripRepository = tripRepository;
        this.tripCreationService = tripCreationService;
    }

    @Value("${booking.window.days}")
    private int bookingWindowDays;

    @Value("${fare.per.km:2.5}")
    private BigDecimal farePerKm;

    @Override
    @Transactional
    public SearchBusesResponse searchBuses(String source, String destination, LocalDate travelDate,
            LocalTime currentTime) {

        LocalDate today = LocalDate.now();

        if (travelDate.isBefore(today)) {
            throw new InvalidTravelDateException("Travel date cannot be in the past");
        }

        if (travelDate.isAfter(today.plusDays(bookingWindowDays))) {
            throw new InvalidTravelDateException(
                    "Booking allowed only up to " + bookingWindowDays + " days in advance");
        }

        // Case-insensitive search for route
        RouteEntity route = routeRepository.findBySourceIgnoreCaseAndDestinationIgnoreCase(
                source.trim(), destination.trim())
                .orElseThrow(() -> new RouteNotFoundException(
                        "No route found from " + source + " to " + destination));

        // Fetch schedules with bus eagerly loaded to avoid N+1 queries
        List<ScheduleEntity> schedules = scheduleRepository
                .findActiveSchedulesByRouteAndDate(route, travelDate, ScheduleStatus.ACTIVE)
                .orElse(List.of());

        if (schedules.isEmpty()) {
            throw new NoBusAvailableException(
                    "No bus available for route from " + source + " to " + destination);
        }

        // Filter by departure time if travel date is today
        boolean isToday = travelDate.isEqual(today);
        if (isToday) {
            schedules = schedules.stream()
                    .filter(schedule -> schedule.getDepartureTime().isAfter(currentTime))
                    .toList();
        }

        if (schedules.isEmpty()) {
            return SearchBusesResponse.builder().results(List.of()).build();
        }

        // Batch fetch existing trips to avoid N+1 queries
        Set<Long> scheduleIds = schedules.stream()
                .map(ScheduleEntity::getId)
                .collect(Collectors.toSet());

        Map<Long, TripEntity> existingTrips = tripRepository
                .findByScheduleIdInAndTravelDate(scheduleIds, travelDate)
                .stream()
                .filter(trip -> trip.getStatus() == TripStatus.ACTIVE)
                .collect(Collectors.toMap(
                        trip -> trip.getSchedule().getId(),
                        Function.identity()));

        // Calculate fare based on distance
        BigDecimal calculatedFare = farePerKm.multiply(BigDecimal.valueOf(route.getDistanceKm()));

        List<TripEntity> trips = new ArrayList<>();
        List<TripEntity> newTripsToSave = new ArrayList<>();

        for (ScheduleEntity schedule : schedules) {
            TripEntity trip = existingTrips.get(schedule.getId());

            if (trip != null) {
                trips.add(trip);
            } else {
                TripEntity newTrip = tripCreationService.createTripWithSeats(
                        schedule,
                        travelDate,
                        calculatedFare);
                trips.add(newTrip);
            }
        }

        // Batch save new trips
        if (!newTripsToSave.isEmpty()) {
            tripRepository.saveAll(newTripsToSave);
        }

        // Build results sorted by departure time
        List<SearchBusesResponse.BusResult> results = trips.stream()
                .filter(trip -> trip.getAvailableSeats() > 0) // Only show buses with available seats
                .sorted(Comparator.comparing(trip -> trip.getSchedule().getDepartureTime()))
                .map(trip -> {
                    ScheduleEntity schedule = trip.getSchedule();
                    BusEntity bus = schedule.getBus();

                    return SearchBusesResponse.BusResult.builder()
                            .tripId(trip.getId())
                            .busNumber(bus.getBusNumber())
                            .busDescription(bus.getDescription())
                            .source(route.getSource())
                            .destination(route.getDestination())
                            .travelDate(trip.getTravelDate())
                            .departureTime(schedule.getDepartureTime())
                            .arrivalTime(schedule.getArrivalTime())
                            .availableSeats(trip.getAvailableSeats())
                            .fare(trip.getFare())
                            .build();
                })
                .toList();

        return SearchBusesResponse.builder().results(results).build();

    }

}
