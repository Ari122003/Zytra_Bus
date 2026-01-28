package com.zytra.user_server.bookings.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.zytra.user_server.bookings.dto.BookingDetails;
import com.zytra.user_server.bookings.entity.BookingEntity;

public interface BookingRepository extends JpaRepository<BookingEntity, Long> {

        /**
         * Fetches booking details for a user including route source and destination,
         * travel date, departure and arrival times, and seat count
         */
        @Query("SELECT new com.zytra.user_server.bookings.dto.BookingDetails(b.id, r.source, r.destination, t.travelDate, s.departureTime, s.arrivalTime, b.seatCount) "
                        +
                        "FROM BookingEntity b " +
                        "JOIN b.trip t " +
                        "JOIN t.schedule s " +
                        "JOIN s.route r " +
                        "WHERE b.user.id = :userId")
        List<BookingDetails> findBookingDetailsByUserId(@Param("userId") Long userId);

        /**
         * Fetches booking by ID
         */
        @Query("SELECT b FROM BookingEntity b WHERE b.id = :bookingId")
        Optional<BookingEntity> findById(@Param("bookingId") Long bookingId);

        /**
         * Fetches booking by ID with trip, schedule, route, bus, and driver details
         * eagerly loaded
         */
        @Query("SELECT b FROM BookingEntity b " +
                        "LEFT JOIN FETCH b.trip t " +
                        "LEFT JOIN FETCH t.schedule s " +
                        "LEFT JOIN FETCH s.route r " +
                        "LEFT JOIN FETCH s.bus bus " +
                        "LEFT JOIN FETCH t.driver d " +
                        "WHERE b.id = :bookingId")
        Optional<BookingEntity> findByIdWithDetails(@Param("bookingId") Long bookingId);

        /**
         * Fetches bookings for a trip with user and ticket details eagerly loaded
         */
        @Query("SELECT b FROM BookingEntity b " +
                        "JOIN FETCH b.user " +
                        "LEFT JOIN FETCH b.ticket " +
                        "WHERE b.trip.id = :tripId")
        List<BookingEntity> findByTripIdWithUser(@Param("tripId") Long tripId);

}
