package com.fitness.backend.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkSyncResponse {

    private String syncLogId;
    private Integer processedAthletes;
    private Integer processedHeightTests;
    private Integer skippedDuplicates;

    @Builder.Default
    private List<String> syncedAthleteIds = new ArrayList<>();

    @Builder.Default
    private List<String> syncedHeightTestIds = new ArrayList<>();

    private String status; // SUCCESS, PARTIAL
}
