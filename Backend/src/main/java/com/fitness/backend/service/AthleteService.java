package com.fitness.backend.service;

import com.fitness.backend.dto.AthleteDto;
import com.fitness.backend.entity.Athlete;
import com.fitness.backend.repository.AthleteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AthleteService {

    private final AthleteRepository athleteRepository;

    public AthleteDto registerAthlete(AthleteDto dto) {
        // Duplicate Prevention Check
        if (dto.getPhone() != null && !dto.getPhone().trim().isEmpty()) {
            Optional<Athlete> existingPhone = athleteRepository.findByPhone(dto.getPhone().trim());
            if (existingPhone.isPresent()) {
                return mapToDto(existingPhone.get()); // Return existing athlete gracefully for offline sync idempotent re-submit
            }
        }

        if (dto.getClientAthleteId() != null && !dto.getClientAthleteId().trim().isEmpty()) {
            Optional<Athlete> existingClient = athleteRepository.findByClientAthleteId(dto.getClientAthleteId().trim());
            if (existingClient.isPresent()) {
                return mapToDto(existingClient.get());
            }
        }

        String clientAthleteId = (dto.getClientAthleteId() != null && !dto.getClientAthleteId().trim().isEmpty())
                ? dto.getClientAthleteId().trim()
                : UUID.randomUUID().toString();

        Athlete athlete = Athlete.builder()
                .clientAthleteId(clientAthleteId)
                .name(dto.getName())
                .gender(dto.getGender())
                .dateOfBirth(dto.getDateOfBirth())
                .phone(dto.getPhone())
                .heightCategory(dto.getHeightCategory())
                .coachName(dto.getCoachName())
                .schoolAcademy(dto.getSchoolAcademy())
                .state(dto.getState())
                .district(dto.getDistrict())
                .build();

        Athlete saved = athleteRepository.save(athlete);
        return mapToDto(saved);
    }

    public AthleteDto getAthleteById(String id) {
        Athlete athlete = athleteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Athlete not found with ID: " + id));
        return mapToDto(athlete);
    }

    public List<AthleteDto> getAllAthletes() {
        return athleteRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AthleteDto> searchAthletes(String query) {
        return athleteRepository.searchByNameOrId(query).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AthleteDto mapToDto(Athlete athlete) {
        return AthleteDto.builder()
                .id(athlete.getId())
                .clientAthleteId(athlete.getClientAthleteId())
                .name(athlete.getName())
                .gender(athlete.getGender())
                .dateOfBirth(athlete.getDateOfBirth())
                .phone(athlete.getPhone())
                .heightCategory(athlete.getHeightCategory())
                .coachName(athlete.getCoachName())
                .schoolAcademy(athlete.getSchoolAcademy())
                .state(athlete.getState())
                .district(athlete.getDistrict())
                .createdAt(athlete.getCreatedAt())
                .updatedAt(athlete.getUpdatedAt())
                .build();
    }
}
