package com.fitness.backend.service;

import com.fitness.backend.dto.HeightTestDto;
import com.fitness.backend.entity.HeightTest;
import com.fitness.backend.repository.HeightTestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HeightTestService {

    private final HeightTestRepository heightTestRepository;

    public HeightTestDto uploadHeightResult(HeightTestDto dto) {
        String clientMeasurementId = (dto.getClientMeasurementId() != null && !dto.getClientMeasurementId().trim().isEmpty())
                ? dto.getClientMeasurementId().trim()
                : UUID.randomUUID().toString();

        // Duplicate Prevention Check using Idempotency Key clientMeasurementId
        Optional<HeightTest> existing = heightTestRepository.findByClientMeasurementId(clientMeasurementId);
        if (existing.isPresent()) {
            return mapToDto(existing.get()); // Idempotent return existing measurement
        }

        HeightTest test = HeightTest.builder()
                .clientMeasurementId(clientMeasurementId)
                .athleteId(dto.getAthleteId())
                .heightCm(dto.getHeightCm())
                .heightPixels(dto.getHeightPixels())
                .markerScale(dto.getMarkerScale())
                .markerConfidence(dto.getMarkerConfidence())
                .poseConfidence(dto.getPoseConfidence())
                .overallConfidence(dto.getOverallConfidence())
                .deviceId(dto.getDeviceId())
                .build();

        HeightTest saved = heightTestRepository.save(test);
        return mapToDto(saved);
    }

    public List<HeightTestDto> getAthleteHistory(String athleteId) {
        return heightTestRepository.findByAthleteIdOrderByCreatedAtDesc(athleteId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public HeightTestDto mapToDto(HeightTest test) {
        return HeightTestDto.builder()
                .id(test.getId())
                .clientMeasurementId(test.getClientMeasurementId())
                .athleteId(test.getAthleteId())
                .heightCm(test.getHeightCm())
                .heightPixels(test.getHeightPixels())
                .markerScale(test.getMarkerScale())
                .markerConfidence(test.getMarkerConfidence())
                .poseConfidence(test.getPoseConfidence())
                .overallConfidence(test.getOverallConfidence())
                .deviceId(test.getDeviceId())
                .createdAt(test.getCreatedAt())
                .build();
    }
}
