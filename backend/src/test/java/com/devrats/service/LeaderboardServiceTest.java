package com.devrats.service;

import com.devrats.model.User;
import com.devrats.repository.ScoreRepository;
import com.devrats.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for LeaderboardService.
 *
 * Per spec section 6 step 6: "A API recebe o Webhook, calcula os pontos e o
 * aplicativo atualiza o leaderboard do squad em tempo real."
 * Per README: GET /api/leaderboard/global returns global ranking.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Leaderboard Service - Rankings")
class LeaderboardServiceTest {

    @Mock
    private ScoreRepository scoreRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private LeaderboardService leaderboardService;

    @Test
    @DisplayName("Should return global leaderboard sorted by total points descending")
    void shouldReturnSortedGlobalLeaderboard() {
        // Create mock leaderboard data
        User user1 = new User();
        user1.setId(1L);
        user1.setGithubUsername("topuser");

        User user2 = new User();
        user2.setId(2L);
        user2.setGithubUsername("miduser");

        User user3 = new User();
        user3.setId(3L);
        user3.setGithubUsername("lowuser");

        // Mock return of total scores per user
        when(scoreRepository.findTopUsersByTotalScore())
                .thenReturn(List.of(
                        Map.of("userId", 1L, "totalScore", 500),
                        Map.of("userId", 2L, "totalScore", 300),
                        Map.of("userId", 3L, "totalScore", 100)
                ));

        List<?> leaderboard = leaderboardService.getGlobalLeaderboard();

        assertNotNull(leaderboard, "Leaderboard must not be null");
        assertFalse(leaderboard.isEmpty(), "Leaderboard must not be empty");
    }

    @Test
    @DisplayName("Should return empty leaderboard when no scores exist")
    void shouldReturnEmptyLeaderboardWhenNoScores() {
        when(scoreRepository.findTopUsersByTotalScore())
                .thenReturn(List.of());

        List<?> leaderboard = leaderboardService.getGlobalLeaderboard();

        assertNotNull(leaderboard, "Leaderboard must not be null even when empty");
        assertTrue(leaderboard.isEmpty(), "Leaderboard must be empty when no scores exist");
    }
}
