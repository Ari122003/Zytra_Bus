package com.zytra.user_server.seat.entity;

import com.zytra.user_server.enums.SeatStatus;
import com.zytra.user_server.trips.entity.TripEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Represents a seat reservation in the database.
 * 
 * Status is derived from lockedUntil field:
 * - No record exists → AVAILABLE
 * - Record exists + lockedUntil is NOT NULL → LOCKED (temporary hold)
 * - Record exists + lockedUntil is NULL → BOOKED (confirmed)
 */
@Entity
@Table(name = "seats", indexes = {
                @Index(name = "idx_seat_trip", columnList = "trip_id")
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

        /**
         * If NOT NULL: seat is LOCKED until this time (temporary hold during booking).
         * If NULL: seat is BOOKED (confirmed reservation).
         */
        @Column(name = "locked_until")
        private LocalDateTime lockedUntil;

        /**
         * Derives seat status from lockedUntil field.
         */
        public SeatStatus getStatus() {
                if (lockedUntil == null) {
                        return SeatStatus.BOOKED;
                }
                return lockedUntil.isAfter(LocalDateTime.now()) ? SeatStatus.LOCKED : SeatStatus.AVAILABLE;
        }

}
