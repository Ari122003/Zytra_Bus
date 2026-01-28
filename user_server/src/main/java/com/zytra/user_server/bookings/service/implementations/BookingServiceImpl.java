package com.zytra.user_server.bookings.service.implementations;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;

import com.zytra.user_server.bookings.dto.BookingDetails;
import com.zytra.user_server.bookings.dto.BookingResponse;
import com.zytra.user_server.bookings.dto.GetBookingByIdResponse;
import com.zytra.user_server.bookings.dto.GetBookingResponse;
import com.zytra.user_server.bookings.entity.BookingEntity;
import com.zytra.user_server.bookings.entity.BookingSeatEntity;
import com.zytra.user_server.bookings.entity.BookingSeatId;
import com.zytra.user_server.bookings.exception.InvalidSeatSelectionException;
import com.zytra.user_server.bookings.exception.NoBookingFoundException;
import com.zytra.user_server.bookings.exception.SeatAlreadyBookedException;
import com.zytra.user_server.bookings.exception.SeatLockExpiredException;
import com.zytra.user_server.bookings.repository.BookingRepository;
import com.zytra.user_server.bookings.repository.BookingSeatRepository;
import com.zytra.user_server.bookings.service.BookingService;
import com.zytra.user_server.enums.BookingStatus;
import com.zytra.user_server.enums.SeatStatus;
import com.zytra.user_server.seat.entity.SeatEntity;
import com.zytra.user_server.seat.repository.SeatRepository;
import com.zytra.user_server.tickets.entity.TicketEntity;
import com.zytra.user_server.tickets.repository.TicketRepository;
import com.zytra.user_server.tickets.service.TicketService;
import com.zytra.user_server.trips.entity.TripEntity;
import com.zytra.user_server.trips.exception.TripNotFoundException;
import com.zytra.user_server.trips.repository.TripRepository;
import com.zytra.user_server.user.entity.UserEntity;
import com.zytra.user_server.user.exception.UserNotFoundException;
import com.zytra.user_server.user.repository.UserRepository;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final TicketService ticketService;
    private final TicketRepository ticketRepository;

    /**
     * Processes a booking for selected seats on a trip.
     * Validates trip and user existence, verifies seat locks belong to user, checks
     * lock expiry,
     * creates booking record, updates seat statuses to BOOKED, generates ticket,
     * and updates trip availability.
     * 
     * @param tripId      the ID of the trip
     * @param userId      the ID of the user making the booking
     * @param seatNumbers array of seat numbers to book
     * @param amount      the total booking amount
     * @return BookingResponse confirming successful booking
     * @throws TripNotFoundException         if trip is not found
     * @throws UserNotFoundException         if user is not found
     * @throws InvalidSeatSelectionException if seats are invalid or not locked by
     *                                       user
     * @throws SeatAlreadyBookedException    if any seat is already booked
     * @throws SeatLockExpiredException      if seat lock has expired
     */
    @Override
    @Transactional
    public BookingResponse processBooking(Long tripId, Long userId, String[] seatNumbers, BigDecimal amount) {
        TripEntity trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new TripNotFoundException("Trip not found with id: " + tripId));

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        List<String> seatList = Arrays.asList(seatNumbers);

        List<SeatEntity> seats = seatRepository.findByTripIdLockOwnerIdSeatNumbersIn(tripId, user.getId(), seatList);

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

        List<BookingSeatEntity> bookingSeats = new ArrayList<>();
        for (SeatEntity seat : seats) {
            seat.setBooking(booking);
            seat.setStatus(SeatStatus.BOOKED);
            seat.setLockedUntil(null);
            seat.setLockOwner(null);

            BookingSeatId bookingSeatId = new BookingSeatId(booking.getId(), seat.getId());
            BookingSeatEntity bookingSeatEntity = BookingSeatEntity.builder()
                    .id(bookingSeatId)
                    .booking(booking)
                    .seat(seat)
                    .build();
            bookingSeats.add(bookingSeatEntity);
        }

        trip.setAvailableSeats(trip.getAvailableSeats() - seats.size());

        seatRepository.saveAll(seats);
        bookingSeatRepository.saveAll(bookingSeats);
        ticketService.generateTicket(booking);
        tripRepository.save(trip);

        return BookingResponse.builder().message("Booking Successful").build();
    }

    /**
     * Retrieves all bookings for a specific user.
     * Validates user existence and fetches all booking details including trip
     * information.
     * 
     * @param userId the ID of the user
     * @return GetBookingResponse containing list of booking details
     * @throws UserNotFoundException   if user is not found
     * @throws NoBookingFoundException if no bookings exist for the user
     */
    @Override
    @Transactional(readOnly = true)
    public GetBookingResponse getBookingsForUser(Long userId) {

        userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        List<BookingDetails> formatedBookings = bookingRepository.findBookingDetailsByUserId(userId);

        if (formatedBookings.isEmpty()) {
            throw new NoBookingFoundException("No bookings found for user with id: " + userId);
        }

        return GetBookingResponse.builder().bookings(formatedBookings).build();

    }

    /**
     * Retrieves detailed information for a specific booking by ID.
     * Fetches booking with trip, route, bus, driver, seat, and ticket details.
     * Calculates travel time and formats response with all relevant information.
     * 
     * @param bookingId the ID of the booking
     * @return GetBookingByIdResponse containing comprehensive booking details
     * @throws NoBookingFoundException if booking or ticket is not found
     */
    @Override
    @Transactional(readOnly = true)
    public GetBookingByIdResponse getBookingById(Long bookingId) {

        BookingEntity booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new NoBookingFoundException("No booking found with id: " + bookingId));

        List<String> seatNumbers = bookingSeatRepository.findSeatNumbersByBookingId(bookingId);

        TicketEntity ticket = ticketRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new NoBookingFoundException("No ticket found for booking id: " + bookingId));

        String travelTime = calculateTravelTime(
                booking.getTrip().getSchedule().getDepartureTime(),
                booking.getTrip().getSchedule().getArrivalTime());

        GetBookingByIdResponse response = GetBookingByIdResponse.builder()
                .bookingId(booking.getId())
                .source(booking.getTrip().getSchedule().getRoute().getSource())
                .destination(booking.getTrip().getSchedule().getRoute().getDestination())
                .travelDate(booking.getTrip().getTravelDate())
                .departureTime(booking.getTrip().getSchedule().getDepartureTime())
                .arrivalTime(booking.getTrip().getSchedule().getArrivalTime())
                .totalSeats(booking.getSeatCount())
                .amount(booking.getTotalAmount().doubleValue())
                .seatNumbers(seatNumbers)
                .distance(booking.getTrip().getSchedule().getRoute().getDistanceKm())
                .travelTime(travelTime)
                .busNumber(booking.getTrip().getSchedule().getBus().getBusNumber())
                .ticketQr(ticket.getQrCodeData())
                .bookingStatus(booking.getBookingStatus().name())
                .driverName(booking.getTrip().getDriver().getName())
                .driverContact(booking.getTrip().getDriver().getPhone())
                .build();

        return response;
    }

    /**
     * Calculates travel time duration between departure and arrival times.
     * Handles overnight trips where arrival time is before departure time.
     * 
     * @param departureTime the departure time
     * @param arrivalTime   the arrival time
     * @return formatted string "HH hours and MM minutes"
     */
    private String calculateTravelTime(LocalTime departureTime, LocalTime arrivalTime) {
        Duration duration;

        if (arrivalTime.isBefore(departureTime)) {
            duration = Duration.between(departureTime, arrivalTime.plusHours(24));
        } else {
            duration = Duration.between(departureTime, arrivalTime);
        }

        long hours = duration.toHours();
        long minutes = duration.toMinutes() % 60;

        return String.format("%02d hours and %02d minutes", hours, minutes);
    }

}
