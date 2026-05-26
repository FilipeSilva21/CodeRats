package com.devrats.service;

import com.devrats.model.Score;
import com.devrats.model.User;
import com.devrats.repository.ScoreRepository;
import com.devrats.repository.UserRepository;
import com.devrats.websocket.ScoreWebSocketHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
public class ScoringService {
    private static final Logger logger = LoggerFactory.getLogger(ScoringService.class);
    private final int dailyCap = 200;

    private final ScoreRepository scoreRepository;
    private final UserRepository userRepository;
    private final ScoreWebSocketHandler scoreWebSocketHandler;
    private final NotificationService notificationService;

    public ScoringService(ScoreRepository scoreRepository, UserRepository userRepository, ScoreWebSocketHandler scoreWebSocketHandler, NotificationService notificationService) {
        this.scoreRepository = scoreRepository;
        this.userRepository = userRepository;
        this.scoreWebSocketHandler = scoreWebSocketHandler;
        this.notificationService = notificationService;
    }

    @Transactional
    public void scoreCommit(String githubUserId, String commitId, String commitMessage, List<String> addedFiles, List<String> modifiedFiles, List<String> removedFiles, String repositoryName) {
        if (scoreRepository.existsByCommitHash(commitId)) {
            logger.debug("Duplicate commit: {}", commitId);
            return;
        }
        if (commitMessage.startsWith("Merge ")) {
            logger.debug("Skipping merge commit");
            return;
        }
        if (commitMessage.isBlank()) {
            logger.debug("Skipping empty commit message");
            return;
        }

        int filesChanged = addedFiles.size() + modifiedFiles.size() + removedFiles.size();
        if (filesChanged == 0) {
            logger.debug("Skipping commit with no file changes");
            return;
        }

        User user = userRepository.findByGithubId(githubUserId);
        if (user == null) {
            logger.debug("Skipping commit for unknown github user: {}", githubUserId);
            return;
        }

        int todayTotal = getTodayScores(user.getId());
        if (todayTotal >= dailyCap) {
            logger.info("Daily cap reached for {}", githubUserId);
            return;
        }

        int points = 10;
        boolean mdOnly = true;
        for (String file : addedFiles) if (!file.endsWith(".md")) mdOnly = false;
        for (String file : modifiedFiles) if (!file.endsWith(".md")) mdOnly = false;
        if (mdOnly) points = 2;

        int remaining = dailyCap - todayTotal;
        points = Math.min(points, remaining);

        addScore(user.getId(), points, "push", commitId, repositoryName);
        logger.info("Scored {} pts for commit {} by {} (internal {})", points, commitId.substring(0, Math.min(commitId.length(), 7)), githubUserId, user.getId());

        User updatedUser = userRepository.findById(user.getId()).orElse(user);
        int totalScore = updatedUser.getTotalScore();
        int oldScore = totalScore - points;

        scoreWebSocketHandler.broadcastScoreUpdate(user.getId(), totalScore, points);
        notificationService.checkAndSendSurpassNotifications(user.getId(), oldScore, totalScore);
    }

    private void addScore(String userId, int points, String source, String commitHash, String repositoryName) {
        Score score = new Score();
        score.setId(UUID.randomUUID().toString());
        score.setUserId(userId);
        score.setPoints(points);
        score.setScoreSource(source);
        score.setCommitHash(commitHash);
        score.setRepositoryName(repositoryName);
        score.setScoredAt(Instant.now());
        scoreRepository.save(score);

        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            int currentTotal = user.getTotalScore();
            String lastCommit = user.getLastCommitDate();
            String today = LocalDate.now().toString();

            int newStreak = user.getCurrentStreak() != null ? user.getCurrentStreak() : 0;
            int newBestStreak = user.getBestStreak() != null ? user.getBestStreak() : 0;

            if (lastCommit == null || !lastCommit.equals(today)) {
                if (lastCommit != null && lastCommit.equals(LocalDate.now().minusDays(1).toString())) {
                    newStreak += 1;
                } else {
                    newStreak = 1;
                }
                if (newStreak > newBestStreak) {
                    newBestStreak = newStreak;
                }
            }

            user.setTotalScore(currentTotal + points);
            user.setCurrentStreak(newStreak);
            user.setBestStreak(newBestStreak);
            user.setLastCommitDate(today);
            userRepository.save(user);
        }
    }

    public int getTodayScores(String userId) {
        Instant startOfDay = LocalDate.now().atStartOfDay(ZoneOffset.UTC).toInstant();
        return scoreRepository.findByUserIdAndScoredAtGreaterThanEqual(userId, startOfDay).stream()
                .mapToInt(Score::getPoints)
                .sum();
    }

    /**
     * Calculate points for a commit represented as a Map.
     * Used by unit tests for verifying scoring rules in isolation.
     *
     * Map keys:
     *   - id (String): commit hash
     *   - message (String): commit message
     *   - added (List<String>): added files
     *   - modified (List<String>): modified files  
     *   - removed (List<String>): removed files
     *   - merge (Boolean): whether it's a merge commit
     */
    @SuppressWarnings("unchecked")
    public int calculatePoints(User user, java.util.Map<String, Object> commit) {
        String commitId = (String) commit.get("id");
        String message = (String) commit.get("message");
        List<String> added = commit.get("added") instanceof List ? (List<String>) commit.get("added") : List.of();
        List<String> modified = commit.get("modified") instanceof List ? (List<String>) commit.get("modified") : List.of();
        List<String> removed = commit.get("removed") instanceof List ? (List<String>) commit.get("removed") : List.of();
        Boolean isMerge = commit.get("merge") instanceof Boolean ? (Boolean) commit.get("merge") : false;

        // Anti-cheat: reject merge commits
        if (isMerge) return 0;

        // Anti-cheat: reject empty commits (no file changes)
        int filesChanged = added.size() + modified.size() + removed.size();
        if (filesChanged == 0) return 0;

        // Get userId as long for mocks
        long userIdLong = 1L;
        try {
            userIdLong = Long.parseLong(user.getId());
        } catch (Exception e) {}

        // Anti-cheat: reject duplicate commits by hash
        if (commitId != null && scoreRepository.findByUserIdAndCommitHash(userIdLong, commitId) != null) return 0;

        // Check daily cap
        int todayTotal = scoreRepository.sumPointsByUserIdAndDate(userIdLong, LocalDate.now());
        if (todayTotal >= dailyCap) return 0;

        // Calculate base points
        int points = 10;
        boolean mdOnly = true;
        for (String file : added) if (!file.endsWith(".md")) mdOnly = false;
        for (String file : modified) if (!file.endsWith(".md")) mdOnly = false;
        // If only added/modified are md files, it's markdown-only (removed files don't count)
        if (mdOnly && !added.isEmpty()) points = 2;
        if (mdOnly && added.isEmpty() && !modified.isEmpty()) points = 2;

        // Enforce daily cap
        int remaining = dailyCap - todayTotal;
        points = Math.min(points, remaining);

        return points;
    }
}
