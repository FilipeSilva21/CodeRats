package com.devrats.controller;

import com.devrats.model.User;
import com.devrats.repository.ScoreRepository;
import com.devrats.repository.UserRepository;
import com.devrats.service.ScoringService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/scores")
public class ScoreController {
    private final ScoreRepository scoreRepository;
    private final UserRepository userRepository;
    private final ScoringService scoringService;

    public ScoreController(ScoreRepository scoreRepository, UserRepository userRepository,
            ScoringService scoringService) {
        this.scoreRepository = scoreRepository;
        this.userRepository = userRepository;
        this.scoringService = scoringService;
    }

    @GetMapping("/me")
    public ResponseEntity<ScoreSummaryResponse> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userId = (String) authentication.getPrincipal();

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<RecentScoreResponse> recent = scoreRepository.findByUserIdOrderByScoredAtDesc(userId).stream()
                .limit(10)
                .map(s -> new RecentScoreResponse(
                        s.getId(),
                        s.getPoints(),
                        s.getScoreSource(),
                        s.getCommitHash(),
                        s.getRepositoryName(),
                        s.getScoredAt() != null ? s.getScoredAt().toString() : null))
                .toList();

        int todayScore = scoringService.getTodayScores(userId);

        return ResponseEntity.ok(new ScoreSummaryResponse(
                recent,
                user.getTotalScore(),
                todayScore,
                user.getEffectiveStreak(),
                user.getBestStreak(),
                0));
    }

    @GetMapping("/me/daily")
    public ResponseEntity<DailyScoreResponse> meDaily() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userId = (String) authentication.getPrincipal();

        int total = scoringService.getTodayScores(userId);

        return ResponseEntity.ok(new DailyScoreResponse(
                total,
                0,
                50,
                total >= 50));
    }

    public record RecentScoreResponse(String id, int points, String source, String commitHash, String repositoryName,
            String scoredAt) {
    }

    public record ScoreSummaryResponse(List<RecentScoreResponse> recentScores, int totalScore, int todayScore,
            int currentStreak, int bestStreak, int streakBonus) {
    }

    public record DailyScoreResponse(int totalPoints, int commitCount, int dailyCap, boolean capped) {
    }
}
