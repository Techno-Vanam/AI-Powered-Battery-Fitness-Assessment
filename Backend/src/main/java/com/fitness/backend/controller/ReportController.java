package com.fitness.backend.controller;

import com.fitness.backend.dto.AthleteReportDto;
import com.fitness.backend.dto.ReportSummaryDto;
import com.fitness.backend.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Reports & Analytics API", description = "Endpoints for System Summary Reports and Individual Athlete Progress Metrics")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/summary")
    @Operation(summary = "Get System Summary Report", description = "Retrieve overall assessment analytics, athlete counts, and average height statistics")
    public ResponseEntity<ReportSummaryDto> getSummaryReport() {
        return ResponseEntity.ok(reportService.getSummaryReport());
    }

    @GetMapping("/athlete/{id}")
    @Operation(summary = "Get Individual Athlete Report", description = "Retrieve individual athlete report with measurement history and height growth cm")
    public ResponseEntity<AthleteReportDto> getAthleteReport(@PathVariable String id) {
        return ResponseEntity.ok(reportService.getAthleteReport(id));
    }
}
