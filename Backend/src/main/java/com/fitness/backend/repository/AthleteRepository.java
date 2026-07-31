package com.fitness.backend.repository;

import com.fitness.backend.entity.Athlete;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AthleteRepository extends JpaRepository<Athlete, String> {
    Optional<Athlete> findByPhone(String phone);
    Optional<Athlete> findByClientAthleteId(String clientAthleteId);
    boolean existsByPhone(String phone);
    boolean existsByClientAthleteId(String clientAthleteId);

    @Query("SELECT a FROM Athlete a WHERE LOWER(a.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(a.id) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Athlete> searchByNameOrId(@Param("query") String query);
}
