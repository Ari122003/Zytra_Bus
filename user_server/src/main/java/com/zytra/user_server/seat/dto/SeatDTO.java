package com.zytra.user_server.seat.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
    private Long lockOwner;
    private LocalDateTime lockedUntil;
    private boolean isBooked;

}
