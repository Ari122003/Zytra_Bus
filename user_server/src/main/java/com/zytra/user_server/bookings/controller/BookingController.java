package com.zytra.user_server.bookings.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zytra.user_server.bookings.dto.BookingRequest;
import com.zytra.user_server.bookings.dto.BookingResponse;
import com.zytra.user_server.bookings.service.BookingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController

@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/create")
    public BookingResponse createBooking(@RequestBody @Valid BookingRequest request) {

        return bookingService.processBooking(request.getTripId(), request.getUserId(), request.getSeatNumbers(),
                request.getAmount());

    }

}
