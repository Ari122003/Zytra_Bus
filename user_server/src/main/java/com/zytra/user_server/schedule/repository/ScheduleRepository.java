package com.zytra.user_server.schedule.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.zytra.user_server.enums.ScheduleStatus;
import com.zytra.user_server.routes.entity.RouteEntity;
import com.zytra.user_server.schedule.entity.ScheduleEntity;

@Repository
public interface ScheduleRepository extends JpaRepository<ScheduleEntity, Long> {

        Optional<List<ScheduleEntity>> findByRoute(RouteEntity route);

        /**
         * Fetches active schedules for a route with bus eagerly loaded, filtered by
         * schedule status and travel date within active period
         */
        @Query("SELECT s FROM ScheduleEntity s " +
                        "JOIN FETCH s.bus " +
                        "WHERE s.route = :route " +
                        "AND s.status = :status " +
                        "AND s.activeFrom <= :travelDate " +
                        "AND s.activeTo >= :travelDate")
        Optional<List<ScheduleEntity>> findActiveSchedulesByRouteAndDate(
                        @Param("route") RouteEntity route,
                        @Param("travelDate") LocalDate travelDate,
                        @Param("status") ScheduleStatus status);

}
