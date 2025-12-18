package com.zytra.user_server.bus.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchBusesResponse {

    private List<BusResult> buses = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BusResult {
        private Long tripId;
        private String busNumber;
        private String source;
        private String destination;
        private LocalDate travelDate;
        private LocalTime departureTime;
        private LocalTime arrivalTime;
        private Integer availableSeats;
        private BigDecimal fare;
    }

}
