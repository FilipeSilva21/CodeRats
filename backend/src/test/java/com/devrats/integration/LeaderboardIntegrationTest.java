package com.devrats.integration;

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
 * Integration tests for Leaderboard endpoints.
 *
 * Per README:
 * - GET /api/leaderboard/global (No Auth) → Global ranking
 *
 * The global leaderboard is publicly accessible without authentication.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Integration: Leaderboard Endpoint")
class LeaderboardIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/leaderboard/global should be accessible without authentication")
    void shouldReturnGlobalLeaderboardWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/leaderboard/global"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/leaderboard/global should return JSON array")
    void shouldReturnJsonArray() throws Exception {
        mockMvc.perform(get("/api/leaderboard/global"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("application/json"));
    }
}
