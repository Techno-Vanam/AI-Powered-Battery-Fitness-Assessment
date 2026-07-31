package com.fitness.backend.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportSummaryDto {

    private Long totalAthletesRegistered;
    private Long totalHeightTestsConducted;
    private Double averageHeightCm;
    private Double minHeightCm;
    private Double maxHeightCm;
    private Long distinctAthletesAssessed;
}
