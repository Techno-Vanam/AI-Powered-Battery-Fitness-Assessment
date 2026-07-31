package com.fitness.backend.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AthleteReportDto {

    private AthleteDto athlete;
    private HeightTestDto latestMeasurement;
    private List<HeightTestDto> measurementHistory;
    private Double heightGrowthCm;
}
