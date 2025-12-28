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

    private static final int TOTAL_ROWS = 12; // Rows A-L
    private static final int SEATS_PER_ROW = 4; // 2x2 layout
    private static final String[] ROW_LABELS = { "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L" };

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public void createSeatsForSingleTrip(TripEntity trip) {
        // Double safety check (idempotent)

        if (trip.getSeatStatus() == TripSeatStatus.INITIALIZED) {
            return;
        }

        if (trip.getSeatStatus() == TripSeatStatus.INITIALIZING) {
            // Another process is initializing
            return;
        }

        // Mark as initializing (prevents race conditions)
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
