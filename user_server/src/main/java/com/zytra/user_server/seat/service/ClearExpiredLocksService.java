package com.zytra.user_server.seat.service;

import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.zytra.user_server.seat.repository.SeatRepository;
import com.zytra.user_server.trips.service.SeatMatrixBroadcastService;
import com.zytra.user_server.seat.entity.SeatEntity;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClearExpiredLocksService {
    private static final Logger log = LoggerFactory.getLogger(ClearExpiredLocksService.class);

    private final SeatRepository seatRepository;
    private final SeatMatrixBroadcastService broadcastService;

    /**
     * Scheduled task that runs every 30 seconds to release expired seat locks.
     * Frees up seats that have passed their lock expiration time, making them
     * available for other users.
     */
    @Scheduled(fixedRate = 30_000)
    @Transactional
    public void clearExpiredSeatLocks() {
        LocalDateTime now = LocalDateTime.now();

        // Get all seats with expired locks before clearing
        List<SeatEntity> expiredSeats = seatRepository.findByLockedUntilBefore(now);

        // Get unique trip IDs from expired seats
        Set<Long> affectedTripIds = expiredSeats.stream()
                .map(seat -> seat.getTrip().getId())
                .collect(Collectors.toSet());

        int releasedCount = seatRepository.clearExpiredLocks(now);

        if (releasedCount > 0) {
            log.info("Released {} expired seat locks at {}", releasedCount, now);

            // Broadcast updates for each affected trip
            affectedTripIds.forEach(tripId -> {
                broadcastService.broadcastSeatMatrixUpdate(tripId);
            });
        }
    }
}
