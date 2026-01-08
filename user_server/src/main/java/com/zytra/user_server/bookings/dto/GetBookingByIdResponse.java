package com.zytra.user_server.bookings.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class GetBookingByIdResponse {
    private Long bookingId;
    private String source;
    private String destination;
    private LocalDate travelDate;
    private LocalTime departureTime;
    private LocalTime arrivalTime;
    private int totalSeats;
    private double amount;
    private List<String> seatNumbers;
    private int distance;
    private String travelTime;
    private String busType;
    private String busNumber;
    private String ticketQr;
    private String bookingStatus;
    private String driverName;
    private String driverContact;

}
