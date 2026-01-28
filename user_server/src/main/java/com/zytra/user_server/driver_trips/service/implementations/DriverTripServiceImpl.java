package com.zytra.user_server.driver_trips.service.implementations;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.zytra.user_server.bookings.entity.BookingEntity;
import com.zytra.user_server.bookings.repository.BookingRepository;
import com.zytra.user_server.driver.repository.DriverRepository;
import com.zytra.user_server.driver_trips.dto.responses.BookingDTO;
import com.zytra.user_server.driver_trips.dto.responses.GetCurrentTripResponse;
import com.zytra.user_server.driver_trips.dto.responses.GetUpcomingTripsResponse;
import com.zytra.user_server.driver_trips.dto.responses.UpcomingTripDTO;
import com.zytra.user_server.driver_trips.service.DriverTripService;
import com.zytra.user_server.enums.TripStatus;
import com.zytra.user_server.trips.entity.TripEntity;
import com.zytra.user_server.trips.repository.TripRepository;

import java.time.LocalDate;
import java.util.Comparator;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DriverTripServiceImpl implements DriverTripService {

        private final DriverRepository driverRepository;
        private final TripRepository tripRepository;
        private final BookingRepository bookingRepository;

        /**
         * Retrieves the current ongoing trip for a driver.
         * Validates driver existence, fetches ongoing trip details, and collects all
         * booking information
         * including passenger details and ticket numbers.
         * 
         * @param driverId the ID of the driver
         * @return GetCurrentTripResponse containing trip details and passenger
         *         bookings, or null if no ongoing trip
         * @throws IllegalArgumentException if driver is not found
         */
        @Override
        @Transactional(readOnly = true)
        public GetCurrentTripResponse getCurrentTrip(Long driverId) {
                if (!driverRepository.existsById(driverId)) {
                        throw new IllegalArgumentException("Driver not found with id: " + driverId);
                }

                Optional<TripEntity> tripOptional = tripRepository.findOngoingTripByDriverId(driverId,
                                TripStatus.ONGOING);

                if (tripOptional.isEmpty()) {
                        return null;
                }

                TripEntity trip = tripOptional.get();

                List<BookingEntity> bookings = bookingRepository.findByTripIdWithUser(trip.getId());

                List<BookingDTO> passengers = bookings.stream()
                                .map(booking -> BookingDTO.builder()
                                                .bookingId(booking.getId())
                                                .passangerId(booking.getUser().getId())
                                                .name(booking.getUser().getName())
                                                .seatCount(booking.getSeatCount())
                                                .ticketNumber(booking.getTicket() != null
                                                                ? booking.getTicket().getTicketNumber()
                                                                : null)
                                                .bookingStatus(booking.getBookingStatus())
                                                .build())
                                .toList();

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

        /**
         * Verifies a ticket by changing the booking status to VERIFIED.
         * Used by drivers to confirm passenger tickets during boarding.
         * 
         * @param bookingId the ID of the booking to verify
         * @throws IllegalArgumentException if booking is not found
         */
        @Override
        @Transactional
        public void verifyTicket(Long bookingId) {
                BookingEntity booking = bookingRepository.findById(bookingId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Booking not found with id: " + bookingId));

                booking.setBookingStatus(com.zytra.user_server.enums.BookingStatus.VERIFIED);
                bookingRepository.save(booking);
        }

        /**
         * Retrieves all upcoming trips for a driver.
         * If driver has an ongoing trip, returns trips scheduled after the current
         * trip.
         * If no ongoing trip exists, returns all active trips from today onwards.
         * Results are sorted by travel date and departure time.
         * 
         * @param driverId the ID of the driver
         * @return GetUpcomingTripsResponse containing list of upcoming trips
         * @throws IllegalArgumentException if driver is not found
         */
        @Override
        @Transactional(readOnly = true)
        public GetUpcomingTripsResponse getUpcomingTrips(Long driverId) {
                if (!driverRepository.existsById(driverId)) {
                        throw new IllegalArgumentException("Driver not found with id: " + driverId);
                }

                Optional<TripEntity> currentTripOptional = tripRepository.findOngoingTripByDriverId(driverId,
                                TripStatus.ONGOING);

                LocalDate cutoffDate;

                if (currentTripOptional.isPresent()) {
                        TripEntity currentTrip = currentTripOptional.get();
                        cutoffDate = currentTrip.getTravelDate();

                        List<TripEntity> allTrips = tripRepository.findDriverIdWithDetails(driverId);

                        List<UpcomingTripDTO> upcomingTrips = allTrips.stream()
                                        .filter(trip -> {
                                                if (trip.getStatus() != TripStatus.ACTIVE) {
                                                        return false;
                                                }

                                                if (trip.getTravelDate().isAfter(cutoffDate)) {
                                                        return true;
                                                }

                                                if (trip.getTravelDate().isEqual(cutoffDate)) {
                                                        return trip.getSchedule().getDepartureTime()
                                                                        .isAfter(currentTrip.getSchedule()
                                                                                        .getArrivalTime());
                                                }

                                                return false;
                                        })
                                        .sorted(Comparator.comparing(TripEntity::getTravelDate)
                                                        .thenComparing(trip -> trip.getSchedule().getDepartureTime()))
                                        .map(trip -> UpcomingTripDTO.builder()
                                                        .tripId(trip.getId())
                                                        .startLocation(trip.getSchedule().getRoute().getSource())
                                                        .endLocation(trip.getSchedule().getRoute().getDestination())
                                                        .travelDate(trip.getTravelDate())
                                                        .departureTime(trip.getSchedule().getDepartureTime())
                                                        .arrivalTime(trip.getSchedule().getArrivalTime())
                                                        .availableSeats(trip.getAvailableSeats())
                                                        .build())
                                        .toList();

                        return GetUpcomingTripsResponse.builder()
                                        .driverId(driverId)
                                        .upcomingTrips(upcomingTrips)
                                        .build();
                } else {
                        cutoffDate = LocalDate.now();

                        List<TripEntity> allTrips = tripRepository.findDriverIdWithDetails(driverId);

                        List<UpcomingTripDTO> upcomingTrips = allTrips.stream()
                                        .filter(trip -> trip.getStatus() == TripStatus.ACTIVE
                                                        && !trip.getTravelDate().isBefore(cutoffDate))
                                        .sorted(Comparator.comparing(TripEntity::getTravelDate)
                                                        .thenComparing(trip -> trip.getSchedule().getDepartureTime()))
                                        .map(trip -> UpcomingTripDTO.builder()
                                                        .tripId(trip.getId())
                                                        .startLocation(trip.getSchedule().getRoute().getSource())
                                                        .endLocation(trip.getSchedule().getRoute().getDestination())
                                                        .travelDate(trip.getTravelDate())
                                                        .departureTime(trip.getSchedule().getDepartureTime())
                                                        .arrivalTime(trip.getSchedule().getArrivalTime())
                                                        .availableSeats(trip.getAvailableSeats())
                                                        .build())
                                        .toList();

                        return GetUpcomingTripsResponse.builder()
                                        .driverId(driverId)
                                        .upcomingTrips(upcomingTrips)
                                        .build();
                }
        }
}
