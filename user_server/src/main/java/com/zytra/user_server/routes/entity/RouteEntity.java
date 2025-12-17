package com.zytra.user_server.routes.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

@Entity
@Table(name = "routes", uniqueConstraints = @UniqueConstraint(name = "uq_route", columnNames = { "source",
        "destination" }))
public class RouteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "source", nullable = false, length = 100)
    private String source;

    @NotNull
    @Column(name = "destination", nullable = false, length = 100)
    private String destination;

    @NotNull
    @Positive
    @Column(name = "distance_km", nullable = false)
    private Integer distanceKm;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

}
