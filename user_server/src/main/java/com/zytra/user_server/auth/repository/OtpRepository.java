package com.zytra.user_server.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.zytra.user_server.auth.entity.OtpEntity;
import java.util.Optional;

@Repository

public interface OtpRepository extends JpaRepository<OtpEntity, Long> {

    @Modifying
    @Transactional
    void deleteByEmail(String email);

    String getOtpByEmail(String email);

    Optional<OtpEntity> findOtpByEmail(String email);

}
