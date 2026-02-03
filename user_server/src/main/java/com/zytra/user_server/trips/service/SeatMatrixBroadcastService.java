package com.zytra.user_server.trips.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.zytra.user_server.seat.dto.SeatDTO;

import lombok.RequiredArgsConstructor;

/**
 * Service responsible for broadcasting seat matrix updates to WebSocket
 * subscribers.
 * Call this service whenever seats are booked, unlocked, or their status
 * changes.
 */
@Service
@RequiredArgsConstructor
public class SeatMatrixBroadcastService {

    private static final Logger log = LoggerFactory.getLogger(SeatMatrixBroadcastService.class);
    private final SimpMessagingTemplate messagingTemplate;
    private final TripService tripService;

    /**
     * Broadcasts the current seat matrix to all subscribers of a specific trip.
     * This should be called whenever seat availability changes (booking, unlock,
     * etc.)
     * 
     * @param tripId the ID of the trip whose seat matrix has changed
     */
    public void broadcastSeatMatrixUpdate(Long tripId) {
        try {
            log.info("Broadcasting seat matrix update for tripId: {}", tripId);
            List<List<SeatDTO>> seatMatrix = tripService.getSeatMatrix(tripId);
            log.info("Seat matrix has {} rows for tripId: {}",
                    seatMatrix != null ? seatMatrix.size() : 0, tripId);

            // Broadcast to all subscribers on this topic
            messagingTemplate.convertAndSend("/topic/seat-matrix/" + tripId, seatMatrix);
            log.info("Successfully broadcast seat matrix update to /topic/seat-matrix/{}", tripId);
        } catch (Exception e) {
            log.error("Error broadcasting seat matrix update for tripId: {}", tripId, e);
        }
    }
}
