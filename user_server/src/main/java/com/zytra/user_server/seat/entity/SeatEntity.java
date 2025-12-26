// ...existing code...
package com.zytra.user_server.seat.entity;

import com.zytra.user_server.bookings.entity.BookingEntity;
import com.zytra.user_server.enums.SeatStatus;
import com.zytra.user_server.trips.entity.TripEntity;
import com.zytra.user_server.user.entity.UserEntity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Represents a seat reservation in the database.
 * 
 * Status is derived from lockedUntil/booking fields:
 * - No record exists → AVAILABLE
 * - Record exists + lockedUntil is NOT NULL and in future → LOCKED (temporary
 * hold)
 * - Record exists + booking is NOT NULL → BOOKED (confirmed)
 */
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

        /**
         * If NOT NULL: seat is LOCKED until this time (temporary hold during booking).
         * If NULL and booking != null: seat is BOOKED (confirmed reservation).
         */
        @Column(name = "locked_until")
        private LocalDateTime lockedUntil;

        // Owner of the temporary lock — now a FK to users table.
        // Only the referenced user (or system actor) should be able to extend/release
        // this lock.
        @ManyToOne(fetch = FetchType.LAZY, optional = true)
        @JoinColumn(name = "lock_owner_id", nullable = true, foreignKey = @ForeignKey(name = "fk_seat_lock_owner", foreignKeyDefinition = "FOREIGN KEY (lock_owner_id) REFERENCES users(id)"))
        private UserEntity lockOwner;

}
