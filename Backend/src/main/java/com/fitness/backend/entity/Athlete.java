package com.fitness.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "athletes", indexes = {
    @Index(name = "idx_athlete_phone", columnList = "phone"),
    @Index(name = "idx_athlete_client_id", columnList = "clientAthleteId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Athlete {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String clientAthleteId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String gender;

    private String dateOfBirth;

    @Column(unique = true)
    private String phone;

    private String heightCategory;

    private String coachName;

    private String schoolAcademy;

    private String state;

    private String district;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) this.createdAt = now;
        if (this.updatedAt == null) this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
