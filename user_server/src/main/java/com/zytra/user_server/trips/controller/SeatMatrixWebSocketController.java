package com.zytra.user_server.trips.controller;

import java.security.Principal;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import com.zytra.user_server.seat.dto.SeatDTO;
import com.zytra.user_server.trips.service.TripService;

import lombok.RequiredArgsConstructor;

/**
 * WebSocket controller for real-time seat matrix updates.
 * Client sends request to /app/seat-matrix/{tripId}
 * Server responds to /user/queue/seat-matrix/{tripId}
 * Broadcasts updates to /topic/seat-matrix/{tripId}
 */
@Controller
@RequiredArgsConstructor
public class SeatMatrixWebSocketController {

    private static final Logger log = LoggerFactory.getLogger(SeatMatrixWebSocketController.class);
    private final TripService tripService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Handles request for seat matrix and sends response to requesting user.
     * 
     * Client sends to: /app/seat-matrix/{tripId}
     * Server responds to: /user/queue/seat-matrix/{tripId}
     * 
     * @param tripId    the ID of the trip
     * @param principal the authenticated user making the request
     */
    @MessageMapping("/seat-matrix/{tripId}")
    public void getSeatMatrix(@DestinationVariable Long tripId, Principal principal) {
        List<List<SeatDTO>> seatMatrix = tripService.getSeatMatrix(tripId);
        
        // Send to topic for broadcast - this works with SimpleBroker
        String topicDestination = "/topic/seat-matrix/" + tripId;
        messagingTemplate.convertAndSend(topicDestination, seatMatrix);
    }
}
