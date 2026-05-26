package com.devrats.integration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for Security Configuration.
 *
 * Verifies that the security filter chain is correctly configured:
 * - Public endpoints are accessible
 * - Protected endpoints require JWT
 * - Webhook endpoints use HMAC (not JWT)
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Integration: Security Configuration")
class SecurityConfigIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Public endpoints should be accessible without authentication")
    void publicEndpointsShouldBeAccessible() throws Exception {
        mockMvc.perform(get("/api/leaderboard/global"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Protected endpoints should return 401 without JWT")
    void protectedEndpointsShouldRequireAuth() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/scores/me"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/squads/my"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Webhook endpoint should NOT require JWT (uses HMAC instead)")
    void webhookEndpointShouldNotRequireJwt() throws Exception {
        // Webhook endpoint uses HMAC validation, not JWT.
        // A request without JWT should not return 401 — it should return
        // 403 (forbidden due to missing/invalid HMAC) instead.
        mockMvc.perform(get("/api/webhooks/github"))
                .andExpect(status().isForbidden());
    }
}
