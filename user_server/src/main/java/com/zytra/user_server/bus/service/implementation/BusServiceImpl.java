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

    /**
     * Searches for available buses between source and destination on a specific
     * date.
     * Validates travel date is within booking window, finds matching route,
     * retrieves active schedules,
     * filters out past departure times for today's date, creates or retrieves
     * trips, and calculates fares.
     * Returns sorted results by departure time with available seats.
     * 
     * @param source      the departure location
     * @param destination the arrival location
     * @param travelDate  the date of travel
     * @param currentTime the current time for filtering today's trips
     * @return SearchBusesResponse containing list of available bus trips
     * @throws InvalidTravelDateException if travel date is in the past or beyond
     *                                    booking window
     * @throws RouteNotFoundException     if no route exists between source and
     *                                    destination
     * @throws NoBusAvailableException    if no schedules are found for the route
     */
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

        RouteEntity route = routeRepository.findBySourceIgnoreCaseAndDestinationIgnoreCase(
                source.trim(), destination.trim())
                .orElseThrow(() -> new RouteNotFoundException(
                        "No route found from " + source + " to " + destination));

        List<ScheduleEntity> schedules = scheduleRepository
                .findActiveSchedulesByRouteAndDate(route, travelDate, ScheduleStatus.ACTIVE)
                .orElse(List.of());

        if (schedules.isEmpty()) {
            throw new NoBusAvailableException(
                    "No bus available for route from " + source + " to " + destination);
        }

        boolean isToday = travelDate.isEqual(today);
        if (isToday) {
            schedules = schedules.stream()
                    .filter(schedule -> schedule.getDepartureTime().isAfter(currentTime))
                    .toList();
        }

        if (schedules.isEmpty()) {
            return SearchBusesResponse.builder().results(List.of()).build();
        }

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

        BigDecimal calculatedFare = farePerKm.multiply(BigDecimal.valueOf(route.getDistanceKm()));

        List<TripEntity> trips = new ArrayList<>();

        for (ScheduleEntity schedule : schedules) {
            TripEntity trip = existingTrips.get(schedule.getId());

            if (trip != null) {
                trips.add(trip);
            } else {
                TripEntity tripEntity = tripCreationService.findOrCreateTrip(
                        schedule,
                        travelDate,
                        calculatedFare);
                if (tripEntity != null) {
                    trips.add(tripEntity);
                }
            }
        }

        List<SearchBusesResponse.BusResult> results = trips.stream()
                .filter(trip -> trip.getAvailableSeats() > 0)
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
