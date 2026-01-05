package com.zytra.user_server.bookings.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.zytra.user_server.bookings.entity.BookingSeatEntity;

public interface BookingSeatRepository extends JpaRepository<BookingSeatEntity, Long> {

}
