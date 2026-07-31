package com.fitness.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AthleteDto {

    private String id;
    private String clientAthleteId;

    @NotBlank(message = "Athlete name is required")
    private String name;

    @NotBlank(message = "Gender is required")
    private String gender;

    private String dateOfBirth;
    private String phone;
    private String heightCategory;
    private String coachName;
    private String schoolAcademy;
    private String state;
    private String district;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
