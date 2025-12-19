package com.zytra.user_server.bus.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "bus", indexes = {
        @Index(name = "idx_bus_search", columnList = "bus_number")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uq_bus_number", columnNames = { "bus_number" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bus_number", nullable = false, length = 20)
    private String busNumber;

    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "description", length = 255, nullable = false)
    private String description;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

}
