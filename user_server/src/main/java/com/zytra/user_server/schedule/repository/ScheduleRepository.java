package com.zytra.user_server.schedule.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zytra.user_server.routes.entity.RouteEntity;
import com.zytra.user_server.schedule.entity.ScheduleEntity;

public interface ScheduleRepository extends JpaRepository<ScheduleEntity, Long> {

    Optional<ScheduleEntity> findByRoute(RouteEntity route);

}
