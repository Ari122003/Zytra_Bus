package com.zytra.user_server.seat.entity;

import com.zytra.user_server.enums.SeatStatus;
import com.zytra.user_server.trips.entity.TripEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "seats", indexes = {
        @Index(name = "idx_seat_status", columnList = "trip_id, seat_status")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uq_trip_seat", columnNames = { "trip_id", "seat_number" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false, foreignKey = @ForeignKey(name = "fk_seat_trip", foreignKeyDefinition = "FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE"))
    private TripEntity trip;

    @Column(name = "seat_number", nullable = false, length = 5)
    private String seatNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "seat_status", nullable = false, length = 20)
    private SeatStatus seatStatus;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

}
