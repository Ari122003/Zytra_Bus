package com.zytra.user_server.seat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.zytra.user_server.seat.entity.SeatEntity;

@Repository
public interface SeatRepository extends JpaRepository<SeatEntity, Long> {

    /**
     * Find all seats for a given trip, ordered by seat number for consistent
     * display.
     */
    @Query("SELECT s FROM SeatEntity s WHERE s.trip.id = :tripId ORDER BY s.seatNumber")
    List<SeatEntity> findByTripIdOrderBySeatNumber(@Param("tripId") Long tripId);
}
