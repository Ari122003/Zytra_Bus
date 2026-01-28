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

    private List<List<SeatDTO>> seatMatrix;
    private int totalRows;
    private int seatsPerRow;

}
