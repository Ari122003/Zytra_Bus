package com.zytra.user_server.trips.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.zytra.user_server.seat.dto.SeatDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder

public class TripResponse {
    private Long tripId;
    private String source;
    private String destination;
    private LocalTime departureTime;
    private LocalTime arrivalTime;
    private LocalDate travelDate;
    private String busNumber;
    private String busType;
    private int distanceInKm;
    private int availableSeats;
    private BigDecimal fare;

    // Seat matrix: 12 rows (A-L), 4 columns per row (2x2 layout)
    private List<List<SeatDTO>> seatMatrix;
    private int totalRows; // 12 rows (A-L)
    private int seatsPerRow; // 4 seats per row (2x2)

}
