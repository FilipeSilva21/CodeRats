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
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for Squad endpoints.
 *
 * Per README:
 * - GET /api/squads/my (JWT) → List my squads
 * - GET /api/squads/:id (JWT) → Squad details
 * - POST /api/squads (JWT) → Create squad
 * - POST /api/squads/join (JWT) → Join by invite code
 *
 * All endpoints require JWT authentication.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Integration: Squad Endpoints")
class SquadIntegrationTest {

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
        testUser.setGithubUsername("squaduser");
        testUser.setGithubId(77777L);
        testUser.setAvatarUrl("https://github.com/squaduser.png");
        testUser = userRepository.save(testUser);
        validToken = jwtProvider.generateToken(testUser.getId());
    }

    @Test
    @DisplayName("GET /api/squads/my should return 401 without JWT")
    void shouldRejectSquadsListWithoutToken() throws Exception {
        mockMvc.perform(get("/api/squads/my"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/squads/my should return squads with valid JWT")
    void shouldReturnSquadsWithValidToken() throws Exception {
        mockMvc.perform(get("/api/squads/my")
                        .header("Authorization", "Bearer " + validToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/squads should return 401 without JWT")
    void shouldRejectSquadCreationWithoutToken() throws Exception {
        mockMvc.perform(post("/api/squads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Test Squad\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/squads should create a squad with valid JWT")
    void shouldCreateSquadWithValidToken() throws Exception {
        mockMvc.perform(post("/api/squads")
                        .header("Authorization", "Bearer " + validToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Test Squad\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Squad"))
                .andExpect(jsonPath("$.inviteCode").exists());
    }

    @Test
    @DisplayName("POST /api/squads/join should return 401 without JWT")
    void shouldRejectSquadJoinWithoutToken() throws Exception {
        mockMvc.perform(post("/api/squads/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"inviteCode\":\"ABC123\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/squads/join should return error for invalid invite code")
    void shouldRejectJoinWithInvalidCode() throws Exception {
        mockMvc.perform(post("/api/squads/join")
                        .header("Authorization", "Bearer " + validToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"inviteCode\":\"INVALID_CODE\"}"))
                .andExpect(status().is4xxClientError());
    }
}
