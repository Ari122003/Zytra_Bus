package com.zytra.user_server.seat.entity;

import com.zytra.user_server.bookings.entity.BookingEntity;
import com.zytra.user_server.enums.SeatStatus;
import com.zytra.user_server.trips.entity.TripEntity;
import com.zytra.user_server.user.entity.UserEntity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "seats", indexes = {
                @Index(name = "idx_seat_trip", columnList = "trip_id"),
                @Index(name = "idx_seat_status", columnList = "status"),
                @Index(name = "idx_seat_lock_owner_id", columnList = "lock_owner_id"),

}, uniqueConstraints = {
                @UniqueConstraint(name = "uq_seat_trip_number", columnNames = { "trip_id", "seat_number" })
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
        @Column(name = "status", nullable = false, length = 20)
        private SeatStatus status;

        @ManyToOne(fetch = FetchType.LAZY, optional = true)
        @JoinColumn(name = "booking_id", nullable = true, foreignKey = @ForeignKey(name = "fk_seat_booking", foreignKeyDefinition = "FOREIGN KEY (booking_id) REFERENCES bookings(id)"))
        private BookingEntity booking;

        @Column(name = "locked_until")
        private LocalDateTime lockedUntil;

        @ManyToOne(fetch = FetchType.LAZY, optional = true)
        @JoinColumn(name = "lock_owner_id", nullable = true, foreignKey = @ForeignKey(name = "fk_seat_lock_owner", foreignKeyDefinition = "FOREIGN KEY (lock_owner_id) REFERENCES users(id)"))
        private UserEntity lockOwner;

}
