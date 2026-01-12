package com.zytra.user_server.bookings.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.zytra.user_server.bookings.dto.BookingRequest;
import com.zytra.user_server.bookings.dto.BookingResponse;
import com.zytra.user_server.bookings.dto.GetBookingByIdResponse;
import com.zytra.user_server.bookings.dto.GetBookingResponse;
import com.zytra.user_server.bookings.service.BookingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController

@RequestMapping("/user/booking")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/create")
    public ResponseEntity<BookingResponse> createBooking(@RequestBody @Valid BookingRequest request) {

        return ResponseEntity
                .ok(bookingService.processBooking(request.getTripId(), request.getUserId(), request.getSeatNumbers(),
                        request.getAmount()));

    }

    @GetMapping("/{userId}")
    public ResponseEntity<GetBookingResponse> getBookingsForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(bookingService.getBookingsForUser(userId));
    }

    @GetMapping("/details/{bookingId}")
    public ResponseEntity<GetBookingByIdResponse> getBookingById(@PathVariable Long bookingId) {
        return ResponseEntity.ok(bookingService.getBookingById(bookingId));
    }

}
