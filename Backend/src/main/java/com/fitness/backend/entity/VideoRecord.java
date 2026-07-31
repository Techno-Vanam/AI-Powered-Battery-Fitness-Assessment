package com.fitness.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "video_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String clientVideoId;

    @Column(nullable = false)
    private String athleteId;

    @Column(nullable = false)
    private String fileName;

    private String filePath;

    private Long fileSize;

    private Integer durationSeconds;

    @Column(nullable = false)
    private String status; // UPLOADED, PROCESSING, COMPLETED, FAILED

    private String errorMessage;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = "UPLOADED";
        }
    }
}
