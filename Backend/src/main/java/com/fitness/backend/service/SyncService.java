package com.fitness.backend.service;

import com.fitness.backend.dto.*;
import com.fitness.backend.entity.SyncLog;
import com.fitness.backend.repository.SyncLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SyncService {

    private final AthleteService athleteService;
    private final HeightTestService heightTestService;
    private final SyncLogRepository syncLogRepository;

    public BulkSyncResponse processBulkSync(BulkSyncRequest request) {
        int processedAthletes = 0;
        int processedHeightTests = 0;
        int skippedDuplicates = 0;

        List<String> syncedAthleteIds = new ArrayList<>();
        List<String> syncedHeightTestIds = new ArrayList<>();

        if (request.getAthletes() != null) {
            for (AthleteDto athleteDto : request.getAthletes()) {
                AthleteDto saved = athleteService.registerAthlete(athleteDto);
                if (saved.getId() != null) {
                    syncedAthleteIds.add(saved.getId());
                    processedAthletes++;
                } else {
                    skippedDuplicates++;
                }
            }
        }

        if (request.getHeightTests() != null) {
            for (HeightTestDto heightDto : request.getHeightTests()) {
                HeightTestDto saved = heightTestService.uploadHeightResult(heightDto);
                if (saved.getId() != null) {
                    syncedHeightTestIds.add(saved.getId());
                    processedHeightTests++;
                } else {
                    skippedDuplicates++;
                }
            }
        }

        SyncLog syncLog = SyncLog.builder()
                .deviceId(request.getDeviceId() != null ? request.getDeviceId() : "UNKNOWN")
                .athleteCount(processedAthletes)
                .heightTestCount(processedHeightTests)
                .skippedDuplicateCount(skippedDuplicates)
                .build();

        SyncLog savedLog = syncLogRepository.save(syncLog);

        return BulkSyncResponse.builder()
                .syncLogId(savedLog.getId())
                .processedAthletes(processedAthletes)
                .processedHeightTests(processedHeightTests)
                .skippedDuplicates(skippedDuplicates)
                .syncedAthleteIds(syncedAthleteIds)
                .syncedHeightTestIds(syncedHeightTestIds)
                .status("SUCCESS")
                .build();
    }
}
