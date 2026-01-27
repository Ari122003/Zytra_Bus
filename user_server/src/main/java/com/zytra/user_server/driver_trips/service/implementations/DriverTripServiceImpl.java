package com.zytra.user_server.driver_trips.service.implementations;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.zytra.user_server.bookings.entity.BookingEntity;
import com.zytra.user_server.bookings.repository.BookingRepository;
import com.zytra.user_server.driver.repository.DriverRepository;
import com.zytra.user_server.driver_trips.dto.responses.BookingDTO;
import com.zytra.user_server.driver_trips.dto.responses.GetCurrentTripResponse;
import com.zytra.user_server.driver_trips.service.DriverTripService;
import com.zytra.user_server.enums.TripStatus;
import com.zytra.user_server.trips.entity.TripEntity;
import com.zytra.user_server.trips.repository.TripRepository;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DriverTripServiceImpl implements DriverTripService {

    private final DriverRepository driverRepository;
    private final TripRepository tripRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional(readOnly = true)
    public GetCurrentTripResponse getCurrentTrip(Long driverId) {
        // Validate driver existence
        if (!driverRepository.existsById(driverId)) {
            throw new IllegalArgumentException("Driver not found with id: " + driverId);
        }

        // Fetch ongoing trip directly from database - optimized query
        Optional<TripEntity> tripOptional = tripRepository.findOngoingTripByDriverId(driverId, TripStatus.ONGOING);

        if (tripOptional.isEmpty()) {
            return null;
        }

        TripEntity trip = tripOptional.get();

        // Fetch bookings for the trip
        List<BookingEntity> bookings = bookingRepository.findByTripIdWithUser(trip.getId());

        // Map bookings to booking DTOs
        List<BookingDTO> passengers = bookings.stream()
                .map(booking -> BookingDTO.builder()
                        .bookingId(booking.getId())
                        .passangerId(booking.getUser().getId())
                        .name(booking.getUser().getName())
                        .seatCount(booking.getSeatCount())
                        .ticketNumber(booking.getTicket() != null ? booking.getTicket().getTicketNumber() : null)
                        .bookingStatus(booking.getBookingStatus())
                        .build())
                .toList();

        // Calculate total passenger count (sum of all seat counts)
        int totalPassengers = bookings.stream()
                .mapToInt(BookingEntity::getSeatCount)
                .sum();

        return GetCurrentTripResponse.builder()
                .tripId(trip.getId())
                .driverId(driverId)
                .busNumber(trip.getSchedule().getBus().getBusNumber())
                .startLocation(trip.getSchedule().getRoute().getSource())
                .endLocation(trip.getSchedule().getRoute().getDestination())
                .startTime(trip.getSchedule().getDepartureTime())
                .estimatedEndTime(trip.getSchedule().getArrivalTime())
                .passengerCount(totalPassengers)
                .bookings(passengers)
                .build();
    }

    @Override
    @Transactional
    public void verifyTicket(Long bookingId) {
        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with id: " + bookingId));

        booking.setBookingStatus(com.zytra.user_server.enums.BookingStatus.VERIFIED);
        bookingRepository.save(booking);
    }
}
