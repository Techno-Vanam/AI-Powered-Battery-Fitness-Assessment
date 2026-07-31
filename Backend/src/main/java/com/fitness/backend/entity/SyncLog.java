package com.fitness.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sync_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String deviceId;

    private Integer athleteCount;

    private Integer heightTestCount;

    private Integer skippedDuplicateCount;

    @Column(nullable = false)
    private LocalDateTime syncedAt;

    @PrePersist
    public void prePersist() {
        if (this.syncedAt == null) {
            this.syncedAt = LocalDateTime.now();
        }
    }
}
