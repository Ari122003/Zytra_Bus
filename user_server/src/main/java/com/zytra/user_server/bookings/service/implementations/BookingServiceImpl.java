package com.zytra.user_server.bookings.service.implementations;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;

import com.zytra.user_server.bookings.dto.BookingResponse;
import com.zytra.user_server.bookings.entity.BookingEntity;
import com.zytra.user_server.bookings.entity.BookingSeatEntity;
import com.zytra.user_server.bookings.entity.BookingSeatId;
import com.zytra.user_server.bookings.exception.InvalidSeatSelectionException;
import com.zytra.user_server.bookings.exception.SeatAlreadyBookedException;
import com.zytra.user_server.bookings.exception.SeatLockExpiredException;
import com.zytra.user_server.bookings.repository.BookingRepository;
import com.zytra.user_server.bookings.repository.BookingSeatRepository;
import com.zytra.user_server.bookings.service.BookingService;
import com.zytra.user_server.enums.BookingStatus;
import com.zytra.user_server.enums.SeatStatus;
import com.zytra.user_server.seat.entity.SeatEntity;
import com.zytra.user_server.seat.repository.SeatRepository;
import com.zytra.user_server.trips.entity.TripEntity;
import com.zytra.user_server.trips.exception.TripNotFoundException;
import com.zytra.user_server.trips.repository.TripRepository;
import com.zytra.user_server.user.entity.UserEntity;
import com.zytra.user_server.user.exception.UserNotFoundException;
import com.zytra.user_server.user.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;

    @Override
    @Transactional
    public BookingResponse processBooking(Long tripId, Long userId, String[] seatNumbers, BigDecimal amount) {
        // Implementation logic for processing the booking

        TripEntity trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new TripNotFoundException("Trip not found with id: " + tripId));

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        List<String> seatList = Arrays.asList(seatNumbers);

        List<SeatEntity> seats = seatRepository.findByTripIdLockOwnerIdSeatNumbersIn(tripId, user.getId(), seatNumbers);

        if (seats.size() != seatList.size()) {
            throw new InvalidSeatSelectionException(
                    "One or more selected seats are invalid or not locked by this user");
        }

        LocalDateTime now = LocalDateTime.now();
        for (SeatEntity seat : seats) {
            if (seat.getBooking() != null) {
                throw new SeatAlreadyBookedException("Seat " + seat.getSeatNumber() + " is already booked");
            }

            if (seat.getLockedUntil() == null || seat.getLockedUntil().isBefore(now)) {
                throw new SeatLockExpiredException("Lock expired for seat " + seat.getSeatNumber());
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

        // Update seats and create booking-seat associations
        List<BookingSeatEntity> bookingSeats = new ArrayList<>();
        for (SeatEntity seat : seats) {
            // Mark seat as booked and clear lock
            seat.setBooking(booking);
            seat.setStatus(SeatStatus.BOOKED);
            seat.setLockedUntil(null);
            seat.setLockOwner(null);

            // Create composite key and booking-seat entity
            BookingSeatId bookingSeatId = new BookingSeatId(booking.getId(), seat.getId());
            BookingSeatEntity bookingSeatEntity = BookingSeatEntity.builder()
                    .id(bookingSeatId)
                    .booking(booking)
                    .seat(seat)
                    .build();
            bookingSeats.add(bookingSeatEntity);
        }

        // Batch save for efficiency
        seatRepository.saveAll(seats);
        bookingSeatRepository.saveAll(bookingSeats);

        return BookingResponse.builder().message("Booking Successful").build();
    }

}
