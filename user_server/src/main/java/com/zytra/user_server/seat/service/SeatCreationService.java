package com.zytra.user_server.seat.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
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
public class SeatCreationService {

    private final TripRepository tripRepository;
    private final SeatRepository seatRepository;

    private static final int TOTAL_ROWS = 12; // Rows A-L
    private static final int SEATS_PER_ROW = 4; // 2x2 layout
    private static final String[] ROW_LABELS = { "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L" };

    @Scheduled(cron = "0 */5 * * * *")
    @Transactional

    public void initializeTripsForUpCommingTrips() {
        List<TripEntity> trips = tripRepository.findTripsNeedingSeatInitialization(
                TripSeatStatus.NOT_INITIALIZED,
                LocalDate.now());

        if (trips.isEmpty()) {
            return;
        }

        log.info("Found {} trips needing seat initialization", trips.size());

        for (TripEntity trip : trips) {
            try {
                initializeSeatsForTrip(trip);
            } catch (Exception e) {
                log.error("Seat init failed for tripId={}", trip.getId(), e);
            }
        }
    }

    private void initializeSeatsForTrip(TripEntity trip) {

        // Double safety check (idempotent)

        if (seatRepository.existsByTripId(trip.getId())) {
            trip.setSeatStatus(TripSeatStatus.INITIALIZED);
            return;
        }

        // Mark as initializing (prevents race conditions)
        trip.setSeatStatus(TripSeatStatus.INITIALIZING);

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

        log.info("Initialized {} seats for tripId={}", seats.size(), trip.getId());

    }

}
