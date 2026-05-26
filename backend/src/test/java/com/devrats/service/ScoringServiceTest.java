package com.devrats.service;

import com.devrats.model.Score;
import com.devrats.model.User;
import com.devrats.repository.ScoreRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ScoringService.
 *
 * Per spec section 4.2 and README scoring rules:
 * - 10 pts per valid commit
 * - 2 pts for markdown-only commits
 * - Max 200 pts per day (daily cap)
 * - Filter empty commits, merge commits, no file changes
 * - Duplicate detection by commit hash
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Scoring Service - Anti-Cheat & Scoring Rules")
class ScoringServiceTest {

    @Mock
    private ScoreRepository scoreRepository;

    @InjectMocks
    private ScoringService scoringService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setGithubUsername("testuser");
    }

    @Test
    @DisplayName("Should award 10 points for a standard commit with code changes")
    void shouldAward10PointsForStandardCommit() {
        // A standard commit with source code file changes
        Map<String, Object> commit = createCommit(
                "abc123", "feat: add new feature",
                List.of("src/Main.java"),
                false
        );

        when(scoreRepository.findByUserIdAndCommitHash(anyLong(), anyString()))
                .thenReturn(null);
        when(scoreRepository.sumPointsByUserIdAndDate(anyLong(), any(LocalDate.class)))
                .thenReturn(0);

        int points = scoringService.calculatePoints(testUser, commit);

        assertEquals(10, points, "A standard commit should be worth 10 points");
    }

    @Test
    @DisplayName("Should award only 2 points for markdown-only commits")
    void shouldAward2PointsForMarkdownOnlyCommit() {
        // Commit that only modifies .md files
        Map<String, Object> commit = createCommit(
                "def456", "docs: update readme",
                List.of("README.md", "docs/guide.md"),
                false
        );

        when(scoreRepository.findByUserIdAndCommitHash(anyLong(), anyString()))
                .thenReturn(null);
        when(scoreRepository.sumPointsByUserIdAndDate(anyLong(), any(LocalDate.class)))
                .thenReturn(0);

        int points = scoringService.calculatePoints(testUser, commit);

        assertEquals(2, points, "Markdown-only commits should be worth 2 points");
    }

    @Test
    @DisplayName("Should enforce daily cap of 200 points")
    void shouldEnforceDailyCap() {
        Map<String, Object> commit = createCommit(
                "ghi789", "feat: another change",
                List.of("src/App.java"),
                false
        );

        when(scoreRepository.findByUserIdAndCommitHash(anyLong(), anyString()))
                .thenReturn(null);
        // User already has 195 points today
        when(scoreRepository.sumPointsByUserIdAndDate(anyLong(), any(LocalDate.class)))
                .thenReturn(195);

        int points = scoringService.calculatePoints(testUser, commit);

        // Should cap at 200 total, so only 5 points awarded
        assertTrue(points <= 5,
                "Points should be capped to not exceed 200 daily total");
    }

    @Test
    @DisplayName("Should return 0 points when daily cap is already reached")
    void shouldReturnZeroWhenDailyCapReached() {
        Map<String, Object> commit = createCommit(
                "jkl012", "feat: yet another change",
                List.of("src/App.java"),
                false
        );

        when(scoreRepository.findByUserIdAndCommitHash(anyLong(), anyString()))
                .thenReturn(null);
        // User already at 200 points
        when(scoreRepository.sumPointsByUserIdAndDate(anyLong(), any(LocalDate.class)))
                .thenReturn(200);

        int points = scoringService.calculatePoints(testUser, commit);

        assertEquals(0, points,
                "No points should be awarded when daily cap is reached");
    }

    @Test
    @DisplayName("Should reject empty commits (--allow-empty)")
    void shouldRejectEmptyCommits() {
        // Empty commit: no file changes
        Map<String, Object> commit = createCommit(
                "mno345", "empty commit",
                Collections.emptyList(),
                false
        );

        int points = scoringService.calculatePoints(testUser, commit);

        assertEquals(0, points, "Empty commits must be worth 0 points");
    }

    @Test
    @DisplayName("Should reject merge commits")
    void shouldRejectMergeCommits() {
        Map<String, Object> commit = createCommit(
                "pqr678", "Merge branch 'main' into feature",
                List.of("src/App.java"),
                true // is merge commit
        );

        int points = scoringService.calculatePoints(testUser, commit);

        assertEquals(0, points, "Merge commits must be worth 0 points");
    }

    @Test
    @DisplayName("Should reject duplicate commits by hash")
    void shouldRejectDuplicateCommits() {
        String commitHash = "stu901";
        Map<String, Object> commit = createCommit(
                commitHash, "feat: add feature",
                List.of("src/App.java"),
                false
        );

        // Simulate that this commit hash already exists
        Score existingScore = new Score();
        existingScore.setCommitHash(commitHash);
        when(scoreRepository.findByUserIdAndCommitHash(anyLong(), eq(commitHash)))
                .thenReturn(existingScore);

        int points = scoringService.calculatePoints(testUser, commit);

        assertEquals(0, points,
                "Duplicate commits must not be scored again");
    }

    @Test
    @DisplayName("Should award 10 pts when commit has mixed .md and code files")
    void shouldAwardFullPointsForMixedFilesCommit() {
        Map<String, Object> commit = createCommit(
                "vwx234", "feat: add feature with docs",
                List.of("src/Main.java", "README.md"),
                false
        );

        when(scoreRepository.findByUserIdAndCommitHash(anyLong(), anyString()))
                .thenReturn(null);
        when(scoreRepository.sumPointsByUserIdAndDate(anyLong(), any(LocalDate.class)))
                .thenReturn(0);

        int points = scoringService.calculatePoints(testUser, commit);

        assertEquals(10, points,
                "Commits with mixed code and markdown files should be worth full 10 points");
    }

    /**
     * Helper method to create a commit map in the structure GitHub webhook sends.
     */
    private Map<String, Object> createCommit(String id, String message, List<String> files, boolean isMerge) {
        return Map.of(
                "id", id,
                "message", message,
                "added", files,
                "modified", Collections.emptyList(),
                "removed", Collections.emptyList(),
                "merge", isMerge
        );
    }
}
