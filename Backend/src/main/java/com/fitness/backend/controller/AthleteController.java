package com.fitness.backend.controller;

import com.fitness.backend.dto.AthleteDto;
import com.fitness.backend.dto.HeightTestDto;
import com.fitness.backend.service.AthleteService;
import com.fitness.backend.service.HeightTestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/athletes")
@RequiredArgsConstructor
@Tag(name = "Athlete API", description = "Endpoints for Athlete Registration, Retrieval, Search, and History")
public class AthleteController {

    private final AthleteService athleteService;
    private final HeightTestService heightTestService;

    @PostMapping
    @Operation(summary = "Register Athlete", description = "Register a new athlete with server-side duplicate prevention by phone or client ID")
    public ResponseEntity<AthleteDto> registerAthlete(@Valid @RequestBody AthleteDto athleteDto) {
        return ResponseEntity.ok(athleteService.registerAthlete(athleteDto));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Athlete Details", description = "Retrieve athlete details by database ID")
    public ResponseEntity<AthleteDto> getAthleteById(@PathVariable String id) {
        return ResponseEntity.ok(athleteService.getAthleteById(id));
    }

    @GetMapping
    @Operation(summary = "Get All Athletes", description = "List all registered athletes")
    public ResponseEntity<List<AthleteDto>> getAllAthletes() {
        return ResponseEntity.ok(athleteService.getAllAthletes());
    }

    @GetMapping("/search")
    @Operation(summary = "Search Athletes", description = "Search athletes by name or ID query string")
    public ResponseEntity<List<AthleteDto>> searchAthletes(@RequestParam String query) {
        return ResponseEntity.ok(athleteService.searchAthletes(query));
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "Get Athlete History", description = "Get chronological measurement history for an athlete")
    public ResponseEntity<List<HeightTestDto>> getAthleteHistory(@PathVariable String id) {
        return ResponseEntity.ok(heightTestService.getAthleteHistory(id));
    }
}
