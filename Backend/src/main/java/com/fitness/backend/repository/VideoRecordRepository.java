package com.fitness.backend.repository;

import com.fitness.backend.entity.VideoRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VideoRecordRepository extends JpaRepository<VideoRecord, String> {
    Optional<VideoRecord> findByClientVideoId(String clientVideoId);
    List<VideoRecord> findByAthleteId(String athleteId);
}
