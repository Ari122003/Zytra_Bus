package com.zytra.user_server.bookings.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.zytra.user_server.bookings.entity.BookingSeatEntity;
import com.zytra.user_server.bookings.entity.BookingSeatId;

public interface BookingSeatRepository extends JpaRepository<BookingSeatEntity, BookingSeatId> {

    /**
     * Fetches seat numbers for a booking
     */
    @Query("SELECT bse.seat.seatNumber FROM BookingSeatEntity bse WHERE bse.booking.id = :bookingId")
    List<String> findSeatNumbersByBookingId(@Param("bookingId") Long bookingId);

}
