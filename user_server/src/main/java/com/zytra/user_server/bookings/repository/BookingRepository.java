package com.zytra.user_server.bookings.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.zytra.user_server.bookings.dto.BookingDetails;
import com.zytra.user_server.bookings.entity.BookingEntity;

public interface BookingRepository extends JpaRepository<BookingEntity, Long> {

    @Query("SELECT new com.zytra.user_server.bookings.dto.BookingDetails(b.id, r.source, r.destination, t.travelDate, s.departureTime, s.arrivalTime, b.seatCount) "
            +
            "FROM BookingEntity b " +
            "JOIN b.trip t " +
            "JOIN t.schedule s " +
            "JOIN s.route r " +
            "WHERE b.user.id = :userId")
    List<BookingDetails> findBookingDetailsByUserId(@Param("userId") Long userId);

}
