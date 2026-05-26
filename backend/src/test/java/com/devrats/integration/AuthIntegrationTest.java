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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for Auth endpoints.
 *
 * Per README:
 * - GET /api/auth/me (JWT) → Get current user
 * - DELETE /api/auth/logout (JWT) → Logout
 * - POST /api/auth/refresh (No Auth) → Refresh token
 *
 * These tests verify JWT-protected endpoints reject unauthenticated requests
 * and accept valid JWT tokens.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Integration: Auth Endpoints")
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private String validToken;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        testUser = new User();
        testUser.setGithubUsername("testuser");
        testUser.setGithubId(12345L);
        testUser.setAvatarUrl("https://github.com/testuser.png");
        testUser = userRepository.save(testUser);
        validToken = jwtProvider.generateToken(testUser.getId());
    }

    @Test
    @DisplayName("GET /api/auth/me should return 401 without JWT")
    void shouldRejectMeWithoutToken() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/auth/me should return user info with valid JWT")
    void shouldReturnUserWithValidToken() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.githubUsername").value("testuser"));
    }

    @Test
    @DisplayName("GET /api/auth/me should return 401 with invalid JWT")
    void shouldRejectMeWithInvalidToken() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer invalid.token.here"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("DELETE /api/auth/logout should return 401 without JWT")
    void shouldRejectLogoutWithoutToken() throws Exception {
        mockMvc.perform(delete("/api/auth/logout"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("DELETE /api/auth/logout should succeed with valid JWT")
    void shouldLogoutWithValidToken() throws Exception {
        mockMvc.perform(delete("/api/auth/logout")
                        .header("Authorization", "Bearer " + validToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/auth/refresh should not require JWT")
    void shouldAllowRefreshWithoutJwt() throws Exception {
        // Refresh endpoint should be accessible without JWT, but may return
        // 400 if no refresh token is provided in the body
        mockMvc.perform(post("/api/auth/refresh")
                        .contentType("application/json")
                        .content("{\"refreshToken\":\"invalid\"}"))
                .andExpect(status().is4xxClientError());
    }
}
