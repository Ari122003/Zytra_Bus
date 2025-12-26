package com.zytra.user_server.trips.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.zytra.user_server.bus.entity.BusEntity;
import com.zytra.user_server.enums.SeatStatus;
import com.zytra.user_server.enums.TripSeatStatus;
import com.zytra.user_server.enums.TripStatus;
import com.zytra.user_server.schedule.entity.ScheduleEntity;
import com.zytra.user_server.seat.entity.SeatEntity;
import com.zytra.user_server.seat.repository.SeatRepository;
import com.zytra.user_server.trips.entity.TripEntity;
import com.zytra.user_server.trips.repository.TripRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TripCreationService {

    private final TripRepository tripRepository;

    @Transactional
    public TripEntity createTripWithSeats(
            ScheduleEntity schedule,
            LocalDate travelDate,
            BigDecimal fare) {

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

}
