package com.zytra.user_server.seat.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zytra.user_server.seat.dto.LockSeatsRequest;
import com.zytra.user_server.seat.dto.LockSeatsResponse;
import com.zytra.user_server.seat.service.SeatService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/seats")
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @PostMapping("/lock")
    public LockSeatsResponse lockSeats(@RequestBody @Valid LockSeatsRequest request) {
        LockSeatsResponse response = seatService.lockSeats(request.getTripId(), request.getSeats(),
                request.getLockOwner());
        return response;
    }

}
