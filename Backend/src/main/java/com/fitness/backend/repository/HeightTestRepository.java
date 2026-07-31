package com.fitness.backend.repository;

import com.fitness.backend.entity.HeightTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HeightTestRepository extends JpaRepository<HeightTest, String> {
    Optional<HeightTest> findByClientMeasurementId(String clientMeasurementId);
    boolean existsByClientMeasurementId(String clientMeasurementId);
    List<HeightTest> findByAthleteIdOrderByCreatedAtDesc(String athleteId);

    @Query("SELECT AVG(h.heightCm) FROM HeightTest h")
    Double getAverageHeightCm();

    @Query("SELECT COUNT(DISTINCT h.athleteId) FROM HeightTest h")
    Long countDistinctAthletesAssessed();
}
