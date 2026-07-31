package com.fitness.backend.repository;

import com.fitness.backend.entity.SyncLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SyncLogRepository extends JpaRepository<SyncLog, String> {
}
