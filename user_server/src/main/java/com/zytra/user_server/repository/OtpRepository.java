package com.zytra.user_server.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zytra.user_server.entity.OtpEntity;

public interface OtpRepository extends JpaRepository<OtpEntity, Long> {

}
