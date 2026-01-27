package com.zytra.user_server.driver_trips.dto.responses;

import com.zytra.user_server.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@AllArgsConstructor
@Data
@Builder
public class BookingDTO {

    private Long bookingId;
    private Long passangerId;
    private String name;
    private int seatCount;
    private String ticketNumber;
    private BookingStatus bookingStatus;

}
