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

        List<SeatEntity> findByTripOrderBySeatNumber(TripEntity trip);

        /**
         * Counts seats for a given trip filtered by seat status
         */
        @Query("SELECT COUNT(s) FROM SeatEntity s WHERE s.trip = :trip AND s.status = :status")
        int countByTripAndStatus(TripEntity trip, SeatStatus status);

        /**
         * Clears expired seat locks where lock time has passed and seat is not booked
         */
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

        /**
         * Fetches seats for a trip filtered by lock owner with pessimistic write lock
         */
        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("SELECT s FROM SeatEntity s WHERE s.trip.id = :tripId AND s.lockOwner.id = :lockOwnerId")
        List<SeatEntity> findByTripIdAndLockOwnerId(Long tripId, Long lockOwnerId);

        /**
         * Fetches seats for a trip by seat numbers
         */
        @Query("SELECT s FROM SeatEntity s WHERE s.trip.id = :tripId AND s.seatNumber IN :seatNumbers")
        List<SeatEntity> findByTripIdAndSeatNumberIn(@Param("tripId") Long tripId,
                        @Param("seatNumbers") List<String> seatNumbers);

        /**
         * Fetches seats for a trip filtered by lock owner and seat numbers
         */
        @Query("SELECT s FROM SeatEntity s WHERE s.trip.id = :tripId AND s.seatNumber IN :seatNumbers AND s.lockOwner.id = :userId ")
        List<SeatEntity> findByTripIdLockOwnerIdSeatNumbersIn(@Param("tripId") Long tripId,
                        @Param("userId") Long userId,
                        @Param("seatNumbers") List<String> seatNumbers);

        /**
         * Finds all seats with locks that have expired before the given time
         */
        @Query("SELECT s FROM SeatEntity s WHERE s.lockedUntil IS NOT NULL AND s.lockedUntil <= :now AND s.booking IS NULL")
        List<SeatEntity> findByLockedUntilBefore(@Param("now") LocalDateTime now);

}
