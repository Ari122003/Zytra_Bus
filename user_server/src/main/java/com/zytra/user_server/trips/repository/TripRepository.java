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

    @Query("""
                SELECT t FROM TripEntity t
                WHERE t.seatStatus = :status
            """)
    List<TripEntity> findBySeatStatus(@Param("status") TripSeatStatus status);

    /**
     * Fetch trip by ID with all related entities eagerly loaded to avoid N+1
     * queries.
     * Loads schedule, route, and bus in a single query.
     */
    @Query("SELECT t FROM TripEntity t " +
            "JOIN FETCH t.schedule s " +
            "JOIN FETCH s.route " +
            "JOIN FETCH s.bus " +
            "WHERE t.id = :tripId")
    Optional<TripEntity> findByIdWithDetails(@Param("tripId") Long tripId);

    /**
     * Batch fetch trips for multiple schedules on a given travel date.
     * Eagerly loads schedule to avoid N+1 queries.
     */
    @Query("SELECT t FROM TripEntity t " +
            "JOIN FETCH t.schedule " +
            "WHERE t.schedule.id IN :scheduleIds " +
            "AND t.travelDate = :travelDate")
    List<TripEntity> findByScheduleIdInAndTravelDate(
            @Param("scheduleIds") Set<Long> scheduleIds,
            @Param("travelDate") LocalDate travelDate);

    @Query("""
                SELECT t FROM TripEntity t
                WHERE t.seatStatus = :status
                  AND t.travelDate >= :today
            """)
    List<TripEntity> findTripsNeedingSeatInitialization(
            @Param("status") TripSeatStatus status,
            @Param("today") LocalDate today);

    /**
     * Find a single trip for a specific driver where current time lies between
     * (departure time - 9 hours) and arrival time.
     * Fetches the trip where:
     * - The driver is assigned to the trip
     * - The travel date is today
     * - Current time is between (departure time - 9 hours) and arrival time
     */
    // @Query(value = """
    // SELECT t.* FROM trips t
    // JOIN schedules s ON s.id = t.schedule_id
    // WHERE t.driver_id = :driverId
    // AND t.travel_date = CURRENT_DATE
    // AND CURRENT_TIME >= (s.departure_time - INTERVAL '5 hours')
    // AND CURRENT_TIME <= s.arrival_time
    // LIMIT 1
    // """, nativeQuery = true)
    // Optional<TripEntity> findTripByDriverIdStartingInOneHour(@Param("driverId")
    // Long driverId);

    @Query("SELECT t FROM TripEntity t " +
            "JOIN FETCH t.schedule s " +
            "JOIN FETCH s.route " +
            "JOIN FETCH s.bus " +
            "WHERE t.driver.id = :driverId")
    List<TripEntity> findDriverIdWithDetails(@Param("driverId") Long driverId);

    @Query("SELECT t FROM TripEntity t " +
            "JOIN FETCH t.schedule s " +
            "JOIN FETCH s.route " +
            "JOIN FETCH s.bus " +
            "WHERE t.driver.id = :driverId AND t.status = :status")
    Optional<TripEntity> findOngoingTripByDriverId(@Param("driverId") Long driverId,
            @Param("status") com.zytra.user_server.enums.TripStatus status);

    /**
     * Find ACTIVE trips for a specific travel date with schedule details.
     * Used by scheduler to check which trips should be marked as ONGOING.
     * 
     * @param status     Trip status (should be ACTIVE)
     * @param travelDate The travel date to check
     * @return List of ACTIVE trips for the date
     */
    @Query("SELECT t FROM TripEntity t " +
            "JOIN FETCH t.schedule s " +
            "WHERE t.status = :status " +
            "AND t.travelDate = :travelDate")
    List<TripEntity> findActiveTripsByDate(
            @Param("status") TripStatus status,
            @Param("travelDate") LocalDate travelDate);

    /**
     * Find ONGOING trips for a specific travel date with schedule details.
     * Used by scheduler to check which trips should be marked as COMPLETED.
     * 
     * @param status     Trip status (should be ONGOING)
     * @param travelDate The travel date to check
     * @return List of ONGOING trips for the date
     */
    @Query("SELECT t FROM TripEntity t " +
            "JOIN FETCH t.schedule s " +
            "WHERE t.status = :status " +
            "AND t.travelDate = :travelDate")
    List<TripEntity> findOngoingTripsByDate(
            @Param("status") TripStatus status,
            @Param("travelDate") LocalDate travelDate);

}
