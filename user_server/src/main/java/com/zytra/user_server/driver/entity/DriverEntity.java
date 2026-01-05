package com.zytra.user_server.driver.entity;

import java.time.LocalDateTime;

import com.zytra.user_server.enums.DriverStatus;
import com.zytra.user_server.routes.entity.RouteEntity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "drivers", indexes = {
        @Index(name = "idx_driver_email", columnList = "email"),
        @Index(name = "idx_driver_route", columnList = "assigned_route_id"),
        @Index(name = "idx_driver_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_route_id", nullable = false, foreignKey = @ForeignKey(name = "fk_driver_route"))
    private RouteEntity assignedRoute;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DriverStatus status = DriverStatus.ACTIVE;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
