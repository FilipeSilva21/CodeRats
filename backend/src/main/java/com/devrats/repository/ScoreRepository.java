package com.devrats.repository;

import com.devrats.model.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;

@Repository
public interface ScoreRepository extends JpaRepository<Score, String> {
    List<Score> findByUserId(String userId);
    
    List<Score> findByUserIdOrderByScoredAtDesc(String userId);
    
    boolean existsByCommitHash(String commitHash);
    
    List<Score> findByUserIdAndScoredAtGreaterThanEqual(String userId, Instant scoredAt);
    
    @Query("SELECT SUM(s.points) FROM Score s WHERE s.userId = :userId AND s.scoredAt >= :since")
    Integer sumPointsByUserIdAndScoredAtAfter(String userId, Instant since);

    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM Score s WHERE s.userId = :userId")
    void deleteByUserId(String userId);
}
