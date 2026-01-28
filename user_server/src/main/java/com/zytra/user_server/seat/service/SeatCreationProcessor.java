package com.zytra.user_server.seat.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.zytra.user_server.enums.SeatStatus;
import com.zytra.user_server.enums.TripSeatStatus;
import com.zytra.user_server.seat.entity.SeatEntity;
import com.zytra.user_server.seat.repository.SeatRepository;
import com.zytra.user_server.trips.entity.TripEntity;
import com.zytra.user_server.trips.repository.TripRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeatCreationProcessor {

    private final SeatRepository seatRepository;
    private final TripRepository tripRepository;

    private static final int TOTAL_ROWS = 12;
    private static final int SEATS_PER_ROW = 4;
    private static final String[] ROW_LABELS = { "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L" };

    /**
     * Creates all seats for a single trip in a new transaction.
     * Performs idempotent checks to prevent duplicate seat creation.
     * Marks trip as INITIALIZING during creation, then INITIALIZED upon completion.
     * Creates 48 seats (12 rows x 4 seats) for the trip.
     * 
     * @param trip the trip entity for which to create seats
     */
    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public void createSeatsForSingleTrip(TripEntity trip) {

        if (trip.getSeatStatus() == TripSeatStatus.INITIALIZED) {
            return;
        }

        if (trip.getSeatStatus() == TripSeatStatus.INITIALIZING) {
            return;
        }

        trip.setSeatStatus(TripSeatStatus.INITIALIZING);
        tripRepository.save(trip);

        List<SeatEntity> seats = new ArrayList<>(TOTAL_ROWS * SEATS_PER_ROW);

        for (int row = 0; row < TOTAL_ROWS; row++) {
            String rowLabel = ROW_LABELS[row];

            for (int col = 1; col <= SEATS_PER_ROW; col++) {
                String seatNumber = rowLabel + col;

                SeatEntity seatEntity = SeatEntity.builder()
                        .trip(trip)
                        .seatNumber(seatNumber)
                        .status(SeatStatus.AVAILABLE)
                        .build();

                seats.add(seatEntity);

            }
        }

        seatRepository.saveAll(seats);

        trip.setSeatStatus(TripSeatStatus.INITIALIZED);
        tripRepository.save(trip);

        log.info("Initialized {} seats for tripId={}", seats.size(), trip.getId());
    }

}
