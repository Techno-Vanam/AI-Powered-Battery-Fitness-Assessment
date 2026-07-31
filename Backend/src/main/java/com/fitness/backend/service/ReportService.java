package com.fitness.backend.service;

import com.fitness.backend.dto.AthleteDto;
import com.fitness.backend.dto.AthleteReportDto;
import com.fitness.backend.dto.HeightTestDto;
import com.fitness.backend.dto.ReportSummaryDto;
import com.fitness.backend.entity.HeightTest;
import com.fitness.backend.repository.AthleteRepository;
import com.fitness.backend.repository.HeightTestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.DoubleSummaryStatistics;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final AthleteRepository athleteRepository;
    private final HeightTestRepository heightTestRepository;
    private final AthleteService athleteService;
    private final HeightTestService heightTestService;

    public ReportSummaryDto getSummaryReport() {
        long totalAthletes = athleteRepository.count();
        List<HeightTest> allTests = heightTestRepository.findAll();
        long totalTests = allTests.size();

        DoubleSummaryStatistics stats = allTests.stream()
                .filter(t -> t.getHeightCm() != null && t.getHeightCm() > 0)
                .mapToDouble(HeightTest::getHeightCm)
                .summaryStatistics();

        Double avgHeight = stats.getCount() > 0 ? Math.round(stats.getAverage() * 10.0) / 10.0 : 0.0;
        Double minHeight = stats.getCount() > 0 ? stats.getMin() : 0.0;
        Double maxHeight = stats.getCount() > 0 ? stats.getMax() : 0.0;
        Long distinctAthletes = heightTestRepository.countDistinctAthletesAssessed();

        return ReportSummaryDto.builder()
                .totalAthletesRegistered(totalAthletes)
                .totalHeightTestsConducted(totalTests)
                .averageHeightCm(avgHeight)
                .minHeightCm(minHeight)
                .maxHeightCm(maxHeight)
                .distinctAthletesAssessed(distinctAthletes != null ? distinctAthletes : 0L)
                .build();
    }

    public AthleteReportDto getAthleteReport(String athleteId) {
        AthleteDto athlete = athleteService.getAthleteById(athleteId);
        List<HeightTestDto> history = heightTestService.getAthleteHistory(athleteId);

        HeightTestDto latest = history.isEmpty() ? null : history.get(0);
        Double growthCm = 0.0;
        if (history.size() >= 2) {
            Double newest = history.get(0).getHeightCm();
            Double oldest = history.get(history.size() - 1).getHeightCm();
            if (newest != null && oldest != null) {
                growthCm = Math.round((newest - oldest) * 10.0) / 10.0;
            }
        }

        return AthleteReportDto.builder()
                .athlete(athlete)
                .latestMeasurement(latest)
                .measurementHistory(history)
                .heightGrowthCm(growthCm)
                .build();
    }
}
