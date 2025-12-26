package com.zytra.user_server.seat.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.zytra.user_server.enums.SeatStatus;
import com.zytra.user_server.enums.TripSeatStatus;
import com.zytra.user_server.seat.entity.SeatEntity;
import com.zytra.user_server.trips.entity.TripEntity;
import com.zytra.user_server.user.entity.UserEntity;

import jakarta.persistence.LockModeType;

@Repository
public interface SeatRepository extends JpaRepository<SeatEntity, Long> {

        /**
         * ;
         * Find all seats for a given trip, ordered by seat number for consistent
         * display.
         */

        List<SeatEntity> findByTripOrderBySeatNumber(TripEntity trip);

        @Query("SELECT COUNT(s) > 0 FROM SeatEntity s WHERE s.trip.id = :tripId")
        boolean existsByTripId(@Param("tripId") Long tripId);

        @Query("SELECT COUNT(s) FROM SeatEntity s WHERE s.trip = :trip AND s.status = :status")
        int countByTripAndStatus(TripEntity trip, SeatStatus status);

        @Modifying
        @Query("""
                            UPDATE SeatEntity s
                            SET s.lockedUntil = NULL,
                                s.lockOwner = NULL
                            WHERE s.lockedUntil IS NOT NULL
                              AND s.lockedUntil <= :now
                              AND s.booking IS NULL
                        """)
        int clearExpiredLocks(@Param("now") LocalDateTime now);

        @Query("SELECT s FROM SeatEntity s WHERE s.trip.id = :tripId AND s.lockOwner.id = :lockOwnerId")
        List<SeatEntity> findByTripIdAndLockOwnerId(Long tripId, Long lockOwnerId);

        /**
         * Find seats that are unavailable (either booked or still locked).
         * - lockedUntil IS NULL means BOOKED (permanently reserved)
         * - lockedUntil > now means still LOCKED (temporarily held)
         */
        @Query("SELECT s FROM SeatEntity s WHERE s.trip.id = :tripId " +
                        "AND s.seatNumber IN :seatNumbers " +
                        "AND (s.lockedUntil IS NULL OR s.lockedUntil > :now)")
        List<SeatEntity> findUnavailableSeats(
                        @Param("tripId") Long tripId,
                        @Param("seatNumbers") String[] seatNumbers,
                        @Param("now") LocalDateTime now);

        /**
         * Delete expired locks for specific seats (cleanup before re-locking).
         */
        @Modifying
        @Query("DELETE FROM SeatEntity s WHERE s.trip.id = :tripId " +
                        "AND s.seatNumber IN :seatNumbers " +
                        "AND (s.lockedUntil IS NOT NULL AND s.lockedUntil <= :now)")
        void deleteExpiredLocks(
                        @Param("tripId") Long tripId,
                        @Param("seatNumbers") List<String> seatNumbers,
                        @Param("now") LocalDateTime now);

        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("SELECT s FROM SeatEntity s WHERE s.trip.id = :tripId AND s.seatNumber IN :seatNumbers")
        List<SeatEntity> findByTripIdAndSeatNumberIn(@Param("tripId") Long tripId,
                        @Param("seatNumbers") List<String> seatNumbers);

        /**
         * Delete expired locks for specific seats for a given owner.
         * NOTE: owner is a UserEntity; method kept for potential future use but not
         * used currently.
         */
        @Modifying
        @Query("DELETE FROM SeatEntity s WHERE s.trip.id = :tripId AND s.seatNumber IN :seatNumbers AND s.lockOwner = :owner")
        void deleteByTripIdAndSeatNumberInAndLockOwner(@Param("tripId") Long tripId,
                        @Param("seatNumbers") List<String> seatNumbers,
                        @Param("owner") com.zytra.user_server.user.entity.UserEntity owner);

}
