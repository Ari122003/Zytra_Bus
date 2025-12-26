package com.zytra.user_server.seat.service;

import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.zytra.user_server.seat.repository.SeatRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClearExpiredLocksService {
    private static final Logger log = LoggerFactory.getLogger(ClearExpiredLocksService.class);

    private final SeatRepository seatRepository;

    /**
     * Runs every 30 seconds to release expired seat locks.
     */
    @Scheduled(fixedRate = 30_000)
    @Transactional
    public void clearExpiredSeatLocks() {
        LocalDateTime now = LocalDateTime.now();

        int releasedCount = seatRepository.clearExpiredLocks(now);

        if (releasedCount > 0) {
            log.info("Released {} expired seat locks at {}", releasedCount, now);
        }
    }
}
