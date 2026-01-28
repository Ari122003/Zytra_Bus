package com.zytra.user_server.trips.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.zytra.user_server.enums.TripSeatStatus;
import com.zytra.user_server.enums.TripStatus;
import com.zytra.user_server.trips.entity.TripEntity;

@Repository
public interface TripRepository extends JpaRepository<TripEntity, Long> {

        TripEntity findByScheduleIdAndTravelDate(Long scheduleId, LocalDate travelDate);

        Optional<TripEntity> findById(Long id);

        /**
         * Fetches trips by seat status
         */
        @Query("""
                            SELECT t FROM TripEntity t
                            WHERE t.seatStatus = :status
                        """)
        List<TripEntity> findBySeatStatus(@Param("status") TripSeatStatus status);

        /**
         * Fetches trip by ID with schedule, route, and bus eagerly loaded to avoid N+1
         * queries
         */
        @Query("SELECT t FROM TripEntity t " +
                        "JOIN FETCH t.schedule s " +
                        "JOIN FETCH s.route " +
                        "JOIN FETCH s.bus " +
                        "WHERE t.id = :tripId")
        Optional<TripEntity> findByIdWithDetails(@Param("tripId") Long tripId);

        /**
         * Batch fetches trips for multiple schedules on a given travel date with
         * schedule eagerly loaded to avoid N+1 queries
         */
        @Query("SELECT t FROM TripEntity t " +
                        "JOIN FETCH t.schedule " +
                        "WHERE t.schedule.id IN :scheduleIds " +
                        "AND t.travelDate = :travelDate")
        List<TripEntity> findByScheduleIdInAndTravelDate(
                        @Param("scheduleIds") Set<Long> scheduleIds,
                        @Param("travelDate") LocalDate travelDate);

        /**
         * Fetches trips with pending seat initialization filtered by seat status and
         * travel date
         */
        @Query("""
                            SELECT t FROM TripEntity t
                            WHERE t.seatStatus = :status
                              AND t.travelDate >= :today
                        """)
        List<TripEntity> findTripsNeedingSeatInitialization(
                        @Param("status") TripSeatStatus status,
                        @Param("today") LocalDate today);

        /**
         * Fetches all trips for a driver with schedule, route, and bus details eagerly
         * loaded
         */
        @Query("SELECT t FROM TripEntity t " +
                        "JOIN FETCH t.schedule s " +
                        "JOIN FETCH s.route " +
                        "JOIN FETCH s.bus " +
                        "WHERE t.driver.id = :driverId")
        List<TripEntity> findDriverIdWithDetails(@Param("driverId") Long driverId);

        /**
         * Fetches ongoing trip for a specific driver filtered by status with schedule,
         * route, and bus details
         */
        @Query("SELECT t FROM TripEntity t " +
                        "JOIN FETCH t.schedule s " +
                        "JOIN FETCH s.route " +
                        "JOIN FETCH s.bus " +
                        "WHERE t.driver.id = :driverId AND t.status = :status")
        Optional<TripEntity> findOngoingTripByDriverId(@Param("driverId") Long driverId,
                        @Param("status") com.zytra.user_server.enums.TripStatus status);

        /**
         * Fetches active trips for a specific travel date with schedule details, used
         * by scheduler to check which trips should be marked as ONGOING
         */
        @Query("SELECT t FROM TripEntity t " +
                        "JOIN FETCH t.schedule s " +
                        "WHERE t.status = :status " +
                        "AND t.travelDate = :travelDate")
        List<TripEntity> findActiveTripsByDate(
                        @Param("status") TripStatus status,
                        @Param("travelDate") LocalDate travelDate);

        /**
         * Fetches ongoing trips for a specific travel date with schedule details, used
         * by scheduler to check which trips should be marked as COMPLETED
         */
        @Query("SELECT t FROM TripEntity t " +
                        "JOIN FETCH t.schedule s " +
                        "WHERE t.status = :status " +
                        "AND t.travelDate = :travelDate")
        List<TripEntity> findOngoingTripsByDate(
                        @Param("status") TripStatus status,
                        @Param("travelDate") LocalDate travelDate);

}
