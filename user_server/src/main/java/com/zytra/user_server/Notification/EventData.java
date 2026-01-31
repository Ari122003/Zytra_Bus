package com.zytra.user_server.Notification;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@AllArgsConstructor
@Builder
@Data

public class EventData {

    private EventType eventType;

    private String email;
    private String userName;

    private String start;
    private String end;
    private String date;
    private String departureTime;
    private String arrivalTime;
    private List<String> seatNumber;

}
