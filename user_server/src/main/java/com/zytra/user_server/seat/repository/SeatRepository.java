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
import com.zytra.user_server.seat.entity.SeatEntity;
import com.zytra.user_server.trips.entity.TripEntity;

import jakarta.persistence.LockModeType;

@Repository
public interface SeatRepository extends JpaRepository<SeatEntity, Long> {

        /**
         * ;
         * Find all seats for a given trip, ordered by seat number for consistent
         * display.
         */

        List<SeatEntity> findByTripOrderBySeatNumber(TripEntity trip);

        // removed unused: existsByTripId was not referenced elsewhere

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

        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("SELECT s FROM SeatEntity s WHERE s.trip.id = :tripId AND s.lockOwner.id = :lockOwnerId")
        List<SeatEntity> findByTripIdAndLockOwnerId(Long tripId, Long lockOwnerId);

        @Query("SELECT s FROM SeatEntity s WHERE s.trip.id = :tripId AND s.seatNumber IN :seatNumbers")
        List<SeatEntity> findByTripIdAndSeatNumberIn(@Param("tripId") Long tripId,
                        @Param("seatNumbers") List<String> seatNumbers);

        @Query("SELECT s FROM SeatEntity s WHERE s.trip.id = :tripId AND s.seatNumber IN :seatNumbers AND s.lockOwner.id = :userId ")
        List<SeatEntity> findByTripIdLockOwnerIdSeatNumbersIn(@Param("tripId") Long tripId,
                        @Param("userId") Long userId,
                        @Param("seatNumbers") List<String> seatNumbers);

}
