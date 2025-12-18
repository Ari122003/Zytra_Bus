package com.zytra.user_server.bookings.entity;

import com.zytra.user_server.seat.entity.SeatEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "booking_seats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingSeatEntity {

    @EmbeddedId
    private BookingSeatId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("bookingId")
    @JoinColumn(name = "booking_id", nullable = false, foreignKey = @ForeignKey(name = "fk_bs_booking", foreignKeyDefinition = "FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE"))
    private BookingEntity booking;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("seatId")
    @JoinColumn(name = "seat_id", nullable = false, foreignKey = @ForeignKey(name = "fk_bs_seat"))
    private SeatEntity seat;

}
