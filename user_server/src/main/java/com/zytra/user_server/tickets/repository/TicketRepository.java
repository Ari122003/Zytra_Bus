package com.zytra.user_server.tickets.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zytra.user_server.tickets.entity.TicketEntity;

public interface TicketRepository extends JpaRepository<TicketEntity, Long> {

}
