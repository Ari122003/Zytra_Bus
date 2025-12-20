package com.zytra.user_server.seat.dto;

import com.zytra.user_server.enums.SeatStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatDTO {
    private String seatNumber;
    private SeatStatus status;
    private String row; // e.g., "A", "B", "C"
    private int column; // e.g., 1, 2, 3, 4
}
