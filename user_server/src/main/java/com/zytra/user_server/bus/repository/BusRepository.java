package com.zytra.user_server.bus.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.zytra.user_server.bus.entity.BusEntity;

@Repository

public interface BusRepository extends JpaRepository<BusEntity, Long> {

    Optional<BusEntity> findById(Long id);

}
