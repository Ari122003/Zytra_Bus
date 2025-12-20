package com.zytra.user_server.trips.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.zytra.user_server.trips.entity.TripEntity;

@Repository
public interface TripRepository extends JpaRepository<TripEntity, Long> {

        TripEntity findByScheduleIdAndTravelDate(Long scheduleId, LocalDate travelDate);

        Optional<TripEntity> findById(Long id);

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

}
