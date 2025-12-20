package com.zytra.user_server.routes.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zytra.user_server.routes.entity.RouteEntity;

@Repository

public interface RouteRepository extends JpaRepository<RouteEntity, Long> {

    Optional<RouteEntity> findBySourceAndDestination(String source, String destination);

    Optional<RouteEntity> findBySourceIgnoreCaseAndDestinationIgnoreCase(String source, String destination);

}
