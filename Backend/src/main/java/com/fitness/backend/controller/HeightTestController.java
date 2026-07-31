package com.fitness.backend.controller;

import com.fitness.backend.dto.HeightTestDto;
import com.fitness.backend.service.HeightTestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/height-tests")
@RequiredArgsConstructor
@Tag(name = "Height Measurement API", description = "Endpoints for Uploading Height Results with Idempotency Key Duplicate Prevention")
public class HeightTestController {

    private final HeightTestService heightTestService;

    @PostMapping
    @Operation(summary = "Upload Height Result", description = "Upload a single height assessment result with X-Idempotency-Key duplicate prevention")
    public ResponseEntity<HeightTestDto> uploadHeightResult(
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody HeightTestDto dto
    ) {
        if (idempotencyKey != null && !idempotencyKey.trim().isEmpty()) {
            dto.setClientMeasurementId(idempotencyKey.trim());
        }
        return ResponseEntity.ok(heightTestService.uploadHeightResult(dto));
    }
}
