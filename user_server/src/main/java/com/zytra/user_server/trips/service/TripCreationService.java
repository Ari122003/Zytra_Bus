package com.zytra.user_server.trips.service;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zytra.user_server.bus.entity.BusEntity;
import com.zytra.user_server.enums.TripSeatStatus;
import com.zytra.user_server.enums.TripStatus;
import com.zytra.user_server.schedule.entity.ScheduleEntity;
import com.zytra.user_server.trips.entity.TripEntity;
import com.zytra.user_server.trips.repository.TripRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TripCreationService {

    private final TripRepository tripRepository;

    /**
     * Finds an existing trip for the given schedule and travel date, or creates a
     * new trip if none exists.
     * Prevents duplicate trips by checking for existing trip before creation.
     * 
     * @param schedule   the schedule entity for the trip
     * @param travelDate the date of travel
     * @param fare       the fare amount for the trip
     * @return the existing or newly created trip entity
     */
    @Transactional
    public TripEntity findOrCreateTrip(
            ScheduleEntity schedule,
            LocalDate travelDate,
            BigDecimal fare) {

        TripEntity existingTrip = tripRepository.findByScheduleIdAndTravelDate(
                schedule.getId(), travelDate);

        if (existingTrip != null) {
            return existingTrip;
        }

        BusEntity bus = schedule.getBus();

        TripEntity trip = TripEntity.builder()
                .schedule(schedule)
                .travelDate(travelDate)
                .availableSeats(bus.getTotalSeats())
                .fare(fare)
                .status(TripStatus.ACTIVE)
                .seatStatus(TripSeatStatus.NOT_INITIALIZED)
                .build();

        trip = tripRepository.save(trip);

        return trip;
    }

    /**
     * Creates a new trip with seats for the given schedule and travel date.
     * 
     * @param schedule   the schedule entity for the trip
     * @param travelDate the date of travel
     * @param fare       the fare amount for the trip
     * @return the newly created trip entity
     */
    @Transactional
    public TripEntity createTripWithSeats(
            ScheduleEntity schedule,
            LocalDate travelDate,
            BigDecimal fare) {
        return findOrCreateTrip(schedule, travelDate, fare);
    }

}
