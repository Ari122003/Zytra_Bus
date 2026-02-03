package com.zytra.user_server.trips.service;

import com.zytra.user_server.enums.TripStatus;
import com.zytra.user_server.trips.entity.TripEntity;
import com.zytra.user_server.trips.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TripStatusScheduler {

    private final TripRepository tripRepository;

    /**
     * Scheduled task that runs every 10 seconds to update trip statuses based on
     * timing.
     * Updates trips that should be ONGOING (current time between departure-1h and
     * arrival)
     * and trips that should be COMPLETED (current time > arrival).
     */
    @Scheduled(fixedRate = 10000, initialDelay = 2000)
    @Transactional
    public void updateTripStatuses() {
        try {

            int ongoingCount = markTripsAsOngoing();
            int completedCount = markTripsAsCompleted();

            // if (ongoingCount > 0 || completedCount > 0) {
            // log.info("Trip status update: {} trips marked as ONGOING, {} trips marked as
            // COMPLETED",
            // ongoingCount, completedCount);
            // } else {
            // log.info("Trip status update: No trips to update");
            // }
        } catch (Exception e) {
            log.error("Error updating trip statuses", e);
        }
    }

    /**
     * Finds trips that should be marked as ONGOING based on their departure and
     * arrival times.
     * Criteria: current time is between (departure time - 1 hour) and arrival time.
     * Only updates trips with ACTIVE status. Handles overnight trips correctly.
     * 
     * @return number of trips updated to ONGOING
     */
    private int markTripsAsOngoing() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalTime currentTime = LocalTime.now();

        // Get active trips from today and yesterday (for overnight trips)
        List<TripEntity> activeTripsToday = tripRepository.findActiveTripsByDate(TripStatus.ACTIVE, today);
        List<TripEntity> activeTripsYesterday = tripRepository.findActiveTripsByDate(TripStatus.ACTIVE, yesterday);

        List<TripEntity> activeTrips = new ArrayList<>();
        activeTrips.addAll(activeTripsToday);
        activeTrips.addAll(activeTripsYesterday);

        if (activeTrips.isEmpty()) {
            return 0;
        }

        List<TripEntity> tripsToUpdate = new java.util.ArrayList<>();

        for (TripEntity trip : activeTrips) {
            LocalTime departureTime = trip.getSchedule().getDepartureTime();
            LocalTime arrivalTime = trip.getSchedule().getArrivalTime();
            LocalTime oneHourBeforeDeparture = departureTime.minusHours(1);

            boolean shouldBeOngoing;
            boolean isOvernightTrip = arrivalTime.isBefore(departureTime);

            if (isOvernightTrip) {
                shouldBeOngoing = (currentTime.isAfter(oneHourBeforeDeparture)
                        || currentTime.equals(oneHourBeforeDeparture))
                        || currentTime.isBefore(arrivalTime);
            } else {
                shouldBeOngoing = (currentTime.isAfter(oneHourBeforeDeparture)
                        || currentTime.equals(oneHourBeforeDeparture))
                        && currentTime.isBefore(arrivalTime);
            }

            if (shouldBeOngoing) {
                tripsToUpdate.add(trip);

            }
        }

        for (TripEntity trip : tripsToUpdate) {
            trip.setStatus(TripStatus.ONGOING);

        }

        if (!tripsToUpdate.isEmpty()) {
            tripRepository.saveAll(tripsToUpdate);
        }

        return tripsToUpdate.size();
    }

    /**
     * Finds trips that have passed their arrival time and marks them as COMPLETED.
     * Criteria: current time >= arrival time. Only updates trips with ONGOING
     * status.
     * Handles overnight trips correctly.
     * 
     * @return number of trips updated to COMPLETED
     */
    private int markTripsAsCompleted() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalTime currentTime = LocalTime.now();

        // Get ongoing trips from today and yesterday (for overnight trips)
        List<TripEntity> ongoingTripsToday = tripRepository.findOngoingTripsByDate(TripStatus.ONGOING, today);
        List<TripEntity> ongoingTripsYesterday = tripRepository.findOngoingTripsByDate(TripStatus.ONGOING, yesterday);

        List<TripEntity> ongoingTrips = new ArrayList<>();
        ongoingTrips.addAll(ongoingTripsToday);
        ongoingTrips.addAll(ongoingTripsYesterday);

        if (ongoingTrips.isEmpty()) {
            return 0;
        }

        List<TripEntity> tripsToUpdate = new java.util.ArrayList<>();

        for (TripEntity trip : ongoingTrips) {
            LocalTime departureTime = trip.getSchedule().getDepartureTime();
            LocalTime arrivalTime = trip.getSchedule().getArrivalTime();
            LocalTime oneHourBeforeDeparture = departureTime.minusHours(1);
            boolean isOvernightTrip = arrivalTime.isBefore(departureTime);

            boolean shouldBeCompleted;

            if (isOvernightTrip) {
                shouldBeCompleted = (currentTime.isAfter(arrivalTime) || currentTime.equals(arrivalTime))
                        && currentTime.isBefore(oneHourBeforeDeparture);
            } else {
                shouldBeCompleted = currentTime.isAfter(arrivalTime) || currentTime.equals(arrivalTime);
            }

            if (shouldBeCompleted) {
                tripsToUpdate.add(trip);

            }
        }

        for (TripEntity trip : tripsToUpdate) {
            trip.setStatus(TripStatus.COMPLETED);

        }

        if (!tripsToUpdate.isEmpty()) {
            tripRepository.saveAll(tripsToUpdate);
        }

        return tripsToUpdate.size();
    }
}
