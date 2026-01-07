package com.zytra.user_server.tickets.service.implementations;

import org.springframework.stereotype.Service;

import com.zytra.user_server.bookings.entity.BookingEntity;
import com.zytra.user_server.tickets.entity.TicketEntity;
import com.zytra.user_server.tickets.repository.TicketRepository;
import com.zytra.user_server.tickets.service.QRCodeService;
import com.zytra.user_server.tickets.service.TicketNumberService;
import com.zytra.user_server.tickets.service.TicketService;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import javax.imageio.ImageIO;
import java.time.LocalDateTime;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CreateTicketService implements TicketService {

    private final TicketRepository ticketRepository;
    private final QRCodeService qrCodeService;
    private final TicketNumberService ticketNumberService;

    @Override
    @Transactional
    public void generateTicket(BookingEntity booking) {

        try {
            String ticketNumber = ticketNumberService.generateTicketNumber(20);

            String qrCodeData = "Ticket Number: " + ticketNumber +
                    "\nBooking ID: " + booking.getId() +
                    "\nUser ID: " + booking.getUser().getId() +
                    "\nTrip ID: " + booking.getTrip().getId();

            BufferedImage qrCodeImage = qrCodeService.generateQRCode(qrCodeData);

            // Encode QR image to PNG and store as Base64 string
            String qrCodeBase64;
            try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                ImageIO.write(qrCodeImage, "PNG", baos);
                qrCodeBase64 = Base64.getEncoder().encodeToString(baos.toByteArray());
            }

            LocalDateTime departureDateTime = booking.getTrip().getTravelDate()
                    .atTime(booking.getTrip().getSchedule().getDepartureTime());

            TicketEntity ticket = TicketEntity.builder()
                    .booking(booking)
                    .ticketNumber(ticketNumber)
                    .qrCodeData(qrCodeBase64)
                    .validUntil(departureDateTime.plusHours(2))
                    .build();

            ticketRepository.save(ticket);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate ticket", e);
        }

    }

}
