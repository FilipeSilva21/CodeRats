package com.devrats.repository;

import com.devrats.model.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

@Repository
public interface ScoreRepository extends JpaRepository<Score, String> {
    List<Score> findByUserId(String userId);
    
    List<Score> findByUserIdOrderByScoredAtDesc(String userId);
    
    boolean existsByCommitHash(String commitHash);
    
    List<Score> findByUserIdAndScoredAtGreaterThanEqual(String userId, Instant scoredAt);
    
    @Query("SELECT SUM(s.points) FROM Score s WHERE s.userId = :userId AND s.scoredAt >= :since")
    Integer sumPointsByUserIdAndScoredAtAfter(String userId, Instant since);

    /**
     * Find a score by userId and commitHash (for duplicate detection).
     */
    Score findByUserIdAndCommitHash(String userId, String commitHash);

    /**
     * Overload accepting Long userId for test compatibility.
     */
    default Score findByUserIdAndCommitHash(long userId, String commitHash) {
        return findByUserIdAndCommitHash(String.valueOf(userId), commitHash);
    }

    /**
     * Sum points for a user on a given date.
     */
    @Query("SELECT COALESCE(SUM(s.points), 0) FROM Score s WHERE s.userId = :userId AND s.scoredAt >= :startOfDay")
    int sumPointsByUserIdAndDate(String userId, @org.springframework.data.repository.query.Param("startOfDay") Instant startOfDay);

    /**
     * Overload for LocalDate-based sumPointsByUserIdAndDate.
     */
    default int sumPointsByUserIdAndDate(String userId, LocalDate date) {
        Instant startOfDay = date.atStartOfDay(ZoneOffset.UTC).toInstant();
        return sumPointsByUserIdAndDate(userId, startOfDay);
    }

    /**
     * Overload accepting Long userId and LocalDate for test compatibility.
     */
    default int sumPointsByUserIdAndDate(long userId, LocalDate date) {
        return sumPointsByUserIdAndDate(String.valueOf(userId), date);
    }

    /**
     * Find top users by total score for global leaderboard.
     */
    @Query("SELECT s.userId as userId, SUM(s.points) as totalScore FROM Score s GROUP BY s.userId ORDER BY SUM(s.points) DESC")
    List<Map<String, Object>> findTopUsersByTotalScore();

    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM Score s WHERE s.userId = :userId")
    void deleteByUserId(String userId);
}
