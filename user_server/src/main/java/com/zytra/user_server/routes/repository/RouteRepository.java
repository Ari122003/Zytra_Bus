package com.zytra.user_server.routes.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zytra.user_server.routes.entity.RouteEntity;

public interface RouteRepository extends JpaRepository<RouteEntity, Long> {

    Optional<RouteEntity> findBySourceAndDestination(String source, String destination);

}
