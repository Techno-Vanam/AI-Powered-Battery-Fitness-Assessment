package com.fitness.backend.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkSyncRequest {

    private String deviceId;

    @Builder.Default
    private List<AthleteDto> athletes = new ArrayList<>();

    @Builder.Default
    private List<HeightTestDto> heightTests = new ArrayList<>();
}
