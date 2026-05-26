package com.devrats.integration;

import com.devrats.model.User;
import com.devrats.repository.UserRepository;
import com.devrats.security.JwtProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for Score endpoints.
 *
 * Per README:
 * - GET /api/scores/me (JWT) → Score summary
 * - GET /api/scores/me/daily (JWT) → Daily progress
 *
 * Both endpoints require JWT authentication.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Integration: Score Endpoints")
class ScoreIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private UserRepository userRepository;

    private String validToken;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        User testUser = new User();
        testUser.setGithubUsername("scoreuser");
        testUser.setGithubId(99999L);
        testUser.setAvatarUrl("https://github.com/scoreuser.png");
        testUser = userRepository.save(testUser);
        validToken = jwtProvider.generateToken(testUser.getId());
    }

    @Test
    @DisplayName("GET /api/scores/me should return 401 without JWT")
    void shouldRejectScoresWithoutToken() throws Exception {
        mockMvc.perform(get("/api/scores/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/scores/me should return score data with valid JWT")
    void shouldReturnScoresWithValidToken() throws Exception {
        mockMvc.perform(get("/api/scores/me")
                        .header("Authorization", "Bearer " + validToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/scores/me/daily should return 401 without JWT")
    void shouldRejectDailyScoresWithoutToken() throws Exception {
        mockMvc.perform(get("/api/scores/me/daily"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/scores/me/daily should return daily data with valid JWT")
    void shouldReturnDailyScoresWithValidToken() throws Exception {
        mockMvc.perform(get("/api/scores/me/daily")
                        .header("Authorization", "Bearer " + validToken))
                .andExpect(status().isOk());
    }
}
