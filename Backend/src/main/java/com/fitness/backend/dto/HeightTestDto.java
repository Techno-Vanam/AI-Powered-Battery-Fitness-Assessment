package com.fitness.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeightTestDto {

    private String id;
    private String clientMeasurementId;

    @NotNull(message = "Athlete ID is required")
    private String athleteId;

    @NotNull(message = "Height value is required")
    private Double heightCm;

    private Double heightPixels;
    private Double markerScale;
    private Double markerConfidence;
    private Double poseConfidence;
    private Double overallConfidence;
    private String deviceId;
    private LocalDateTime createdAt;
}
