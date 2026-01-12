package com.zytra.user_server.driver.repository;

import com.zytra.user_server.driver.entity.DriverEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<DriverEntity, Long> {
    Optional<DriverEntity> findByEmail(String email);

    boolean existsByEmail(String email);
}
