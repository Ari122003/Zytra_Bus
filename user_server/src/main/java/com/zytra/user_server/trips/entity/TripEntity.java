package com.zytra.user_server.trips.entity;

import com.zytra.user_server.enums.TripSeatStatus;
import com.zytra.user_server.enums.TripStatus;
import com.zytra.user_server.schedule.entity.ScheduleEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "trips", indexes = {
                @Index(name = "idx_trip_search", columnList = "travel_date")
}, uniqueConstraints = {
                @UniqueConstraint(name = "uq_trip", columnNames = { "schedule_id", "travel_date" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripEntity {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "schedule_id", nullable = false, foreignKey = @ForeignKey(name = "fk_trip_schedule"))
        private ScheduleEntity schedule;

        @Column(name = "travel_date", nullable = false)
        private LocalDate travelDate;

        @Column(name = "available_seats", nullable = false)
        private Integer availableSeats;

        @Column(name = "fare", nullable = false, precision = 10, scale = 2)
        private BigDecimal fare;

        @Enumerated(EnumType.STRING)
        @Column(name = "status", nullable = false, length = 20)
        private TripStatus status;

        @Enumerated(EnumType.STRING)
        @Column(name = "seat_status", nullable = false, length = 20)
        private TripSeatStatus seatStatus;

        @CreationTimestamp
        @Column(name = "created_at", updatable = false)
        private LocalDateTime createdAt;

}
