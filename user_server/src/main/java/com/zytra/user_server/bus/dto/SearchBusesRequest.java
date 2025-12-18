package com.zytra.user_server.bus.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SearchBusesRequest {

    private String source;
    private String destination;
    private LocalDate travelDate;
    private LocalTime currentTime;

}
