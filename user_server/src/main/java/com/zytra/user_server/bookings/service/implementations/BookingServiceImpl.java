package com.zytra.user_server.bookings.service.implementations;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;

import com.zytra.user_server.bookings.dto.BookingResponse;
import com.zytra.user_server.bookings.entity.BookingEntity;
import com.zytra.user_server.bookings.entity.BookingSeatEntity;
import com.zytra.user_server.bookings.repository.BookingRepository;
import com.zytra.user_server.bookings.repository.BookingSeatRepository;
import com.zytra.user_server.bookings.service.BookingService;
import com.zytra.user_server.enums.BookingStatus;
import com.zytra.user_server.seat.entity.SeatEntity;
import com.zytra.user_server.seat.repository.SeatRepository;
import com.zytra.user_server.trips.entity.TripEntity;
import com.zytra.user_server.trips.repository.TripRepository;
import com.zytra.user_server.user.entity.UserEntity;
import com.zytra.user_server.user.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    TripRepository tripRepository;
    UserRepository userRepository;
    SeatRepository seatRepository;
    BookingRepository bookingRepository;
    BookingSeatRepository bookingSeatRepository;

    @Override
    @Transactional
    public BookingResponse processBooking(Long tripId, Long userId, String[] seatNumbers, BigDecimal amount) {
        // Implementation logic for processing the booking

        TripEntity trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> seatList = Arrays.asList(seatNumbers);

        List<SeatEntity> seats = seatRepository.findByTripIdLockOwnerIdSeatNumbersIn(tripId, user.getId(), seatNumbers);

        if (seats.size() != seatList.size()) {
            throw new RuntimeException("One or more selected seats are invalid");
        }

        for (SeatEntity seat : seats) {

            if (seat.getBooking() != null) {
                throw new RuntimeException("One or more selected seats are already booked");
            }

            if (seat.getLockedUntil().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("One or more selected seats are not locked");
            }

        }

        BookingEntity booking = BookingEntity.builder()
                .user(user)
                .trip(trip)
                .seatCount(seats.size())
                .totalAmount(amount)
                .bookingStatus(BookingStatus.CONFIRMED)
                .build();

        bookingRepository.save(booking);

        for (SeatEntity seat : seats) {
            BookingSeatEntity bookingSeatEntity = BookingSeatEntity.builder()
                    .booking(booking)
                    .seat(seat)
                    .build();

            bookingSeatRepository.save(bookingSeatEntity);
        }

        return BookingResponse.builder().message("Booking Successful").build();
    }

}
