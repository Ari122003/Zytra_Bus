package com.zytra.user_server.tickets.service;

import com.zytra.user_server.bookings.entity.BookingEntity;

public interface TicketService {

    public void generateTicket(BookingEntity booking);

}
