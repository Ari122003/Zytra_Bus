package com.zytra.user_server.seat.service;

import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.zytra.user_server.enums.TripSeatStatus;
import com.zytra.user_server.trips.entity.TripEntity;
import com.zytra.user_server.trips.repository.TripRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeatCreationService {

    private final TripRepository tripRepository;
    private final SeatCreationProcessor seatCreationProcessor;

    @Scheduled(fixedRate = 30000)
    public void initializeSeatsForTrip() {

        List<TripEntity> trips = tripRepository.findBySeatStatus(TripSeatStatus.NOT_INITIALIZED);

        for (TripEntity trip : trips) {

            try {
                seatCreationProcessor.createSeatsForSingleTrip(trip);
                log.info("Completed seat initialization for Trip ID: {}", trip.getId());
            } catch (Exception e) {
                log.error("Error initializing seats for Trip ID: {}: {}", trip.getId(), e.getMessage());
            }

        }
    }

}
