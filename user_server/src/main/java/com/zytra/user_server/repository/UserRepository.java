package com.zytra.user_server.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zytra.user_server.entity.UserEntity;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<UserEntity> findByEmailAndStatus(String email, String status);

    String findPasswordByEmail(String email);

}
