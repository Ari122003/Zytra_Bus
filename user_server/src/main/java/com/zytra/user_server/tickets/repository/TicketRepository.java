package com.zytra.user_server.tickets.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.zytra.user_server.tickets.entity.TicketEntity;

public interface TicketRepository extends JpaRepository<TicketEntity, Long> {

    @Query("SELECT t FROM TicketEntity t WHERE t.booking.id = :bookingId")
    Optional<TicketEntity> findByBookingId(Long bookingId);
}
