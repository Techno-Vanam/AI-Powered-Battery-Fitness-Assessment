package com.fitness.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "height_tests", indexes = {
    @Index(name = "idx_height_athlete_id", columnList = "athleteId"),
    @Index(name = "idx_height_client_id", columnList = "clientMeasurementId", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeightTest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String clientMeasurementId;

    @Column(nullable = false)
    private String athleteId;

    @Column(nullable = false)
    private Double heightCm;

    private Double heightPixels;

    private Double markerScale;

    private Double markerConfidence;

    private Double poseConfidence;

    private Double overallConfidence;

    private String deviceId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
