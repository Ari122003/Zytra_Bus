package com.zytra.user_server.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.zytra.user_server.user.entity.UserEntity;

@Repository

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsById(Long id);

    Optional<UserEntity> findByEmailAndStatus(String email, String status);

    String findPasswordByEmail(String email);

    Optional<UserEntity> findById(Long userId);

}
