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
import java.util.List;

/**
 * Scheduler service to automatically update trip statuses based on timing.
 * Runs every 10 seconds to check:
 * 1. Trips where current time is between (departure - 1 hour) and arrival -
 * sets status to ONGOING
 * 2. Trips where current time > arrival - sets status to COMPLETED
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TripStatusScheduler {

    private final TripRepository tripRepository;

    /**
     * Scheduled task that runs every 10 seconds to update trip statuses.
     * Updates trips that should be ONGOING (current time between departure-1h and
     * arrival)
     * and trips that should be COMPLETED (current time > arrival).
     */
    @Scheduled(fixedRate = 10000, initialDelay = 2000) // Run every 10 seconds, start after 2 seconds
    @Transactional
    public void updateTripStatuses() {
        try {
            log.info("Running trip status update scheduler at {}", LocalTime.now());

            int ongoingCount = markTripsAsOngoing();
            int completedCount = markTripsAsCompleted();

            if (ongoingCount > 0 || completedCount > 0) {
                log.info("Trip status update: {} trips marked as ONGOING, {} trips marked as COMPLETED",
                        ongoingCount, completedCount);
            } else {
                log.info("Trip status update: No trips to update");
            }
        } catch (Exception e) {
            log.error("Error updating trip statuses", e);
        }
    }

    /**
     * Finds trips that should be marked as ONGOING.
     * Criteria: current time is between (departure time - 1 hour) and arrival time.
     * Only updates trips with ACTIVE status (avoids resetting if already ONGOING).
     * Handles overnight trips (e.g., departure 22:00, arrival 06:00).
     * 
     * @return number of trips updated to ONGOING
     */
    private int markTripsAsOngoing() {
        LocalDate today = LocalDate.now();
        LocalTime currentTime = LocalTime.now();

        // Get all ACTIVE trips for today
        List<TripEntity> activeTrips = tripRepository.findActiveTripsByDate(TripStatus.ACTIVE, today);

        log.info("{} ACTIVE trips found for {}", activeTrips.size(), today);

        if (activeTrips.isEmpty()) {
            return 0;
        }

        List<TripEntity> tripsToUpdate = new java.util.ArrayList<>();

        for (TripEntity trip : activeTrips) {
            LocalTime departureTime = trip.getSchedule().getDepartureTime();
            LocalTime arrivalTime = trip.getSchedule().getArrivalTime();
            LocalTime oneHourBeforeDeparture = departureTime.minusHours(1);

            boolean shouldBeOngoing;
            boolean isOvernightTrip = arrivalTime.isBefore(departureTime); // Trip crosses midnight

            if (isOvernightTrip) {
                // For overnight trips: current >= (departure - 1h) OR current < arrival
                // Example: dep=22:00, arr=06:00, start=21:00
                // ONGOING if: time >= 21:00 OR time < 06:00
                shouldBeOngoing = (currentTime.isAfter(oneHourBeforeDeparture)
                        || currentTime.equals(oneHourBeforeDeparture))
                        || currentTime.isBefore(arrivalTime);
            } else {
                // For same-day trips: current >= (departure - 1h) AND current < arrival
                shouldBeOngoing = (currentTime.isAfter(oneHourBeforeDeparture)
                        || currentTime.equals(oneHourBeforeDeparture))
                        && currentTime.isBefore(arrivalTime);
            }

            if (shouldBeOngoing) {
                tripsToUpdate.add(trip);
                log.debug("Trip {} scheduled for ONGOING (dep: {}, arr: {}, current: {}, overnight: {})",
                        trip.getId(), departureTime, arrivalTime, currentTime, isOvernightTrip);
            }
        }

        for (TripEntity trip : tripsToUpdate) {
            trip.setStatus(TripStatus.ONGOING);
            log.info("Trip {} marked as ONGOING (departure: {}, arrival: {})",
                    trip.getId(), trip.getSchedule().getDepartureTime(),
                    trip.getSchedule().getArrivalTime());
        }

        if (!tripsToUpdate.isEmpty()) {
            tripRepository.saveAll(tripsToUpdate);
        }

        return tripsToUpdate.size();
    }

    /**
     * Finds trips that have passed their arrival time and marks them as COMPLETED.
     * Criteria: current time >= arrival time.
     * Only updates trips with ONGOING status (avoids resetting if already
     * COMPLETED).
     * Handles overnight trips correctly.
     * 
     * @return number of trips updated to COMPLETED
     */
    private int markTripsAsCompleted() {
        LocalDate today = LocalDate.now();
        LocalTime currentTime = LocalTime.now();

        // Get all ONGOING trips for today
        List<TripEntity> ongoingTrips = tripRepository.findOngoingTripsByDate(TripStatus.ONGOING, today);

        log.info("{} ONGOING trips found for {}", ongoingTrips.size(), today);

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
                // For overnight trips: completed if current >= arrival AND current < (departure
                // - 1h)
                // Example: dep=22:00, arr=08:00, start window=21:00
                // COMPLETED if: time >= 08:00 AND time < 21:00 (morning/afternoon after
                // arrival)
                shouldBeCompleted = (currentTime.isAfter(arrivalTime) || currentTime.equals(arrivalTime))
                        && currentTime.isBefore(oneHourBeforeDeparture);
            } else {
                // For same-day trips: completed if current >= arrival
                shouldBeCompleted = currentTime.isAfter(arrivalTime) || currentTime.equals(arrivalTime);
            }

            if (shouldBeCompleted) {
                tripsToUpdate.add(trip);
                log.debug("Trip {} scheduled for COMPLETED (dep: {}, arr: {}, current: {}, overnight: {})",
                        trip.getId(), departureTime, arrivalTime, currentTime, isOvernightTrip);
            }
        }

        for (TripEntity trip : tripsToUpdate) {
            trip.setStatus(TripStatus.COMPLETED);
            log.info("Trip {} marked as COMPLETED (arrival: {})",
                    trip.getId(), trip.getSchedule().getArrivalTime());
        }

        if (!tripsToUpdate.isEmpty()) {
            tripRepository.saveAll(tripsToUpdate);
        }

        return tripsToUpdate.size();
    }
}
