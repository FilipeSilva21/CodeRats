package com.devrats.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for JwtProvider.
 *
 * Per README: Authentication uses GitHub OAuth 2.0 + JWT.
 * The JWT provider is responsible for generating and validating access tokens
 * that protect all authenticated API endpoints.
 */
@DisplayName("JWT Provider - Token Security")
class JwtProviderTest {

    private JwtProvider jwtProvider;
    private static final String TEST_SECRET = "test-secret-key-that-is-at-least-256-bits-long-for-hmac-sha256-algorithm";
    private static final long EXPIRATION_MS = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        jwtProvider = new JwtProvider(TEST_SECRET, EXPIRATION_MS);
    }

    @Test
    @DisplayName("Should generate a non-null JWT token for a valid user ID")
    void shouldGenerateToken() {
        String token = jwtProvider.generateToken(1L);

        assertNotNull(token, "Generated token must not be null");
        assertFalse(token.isBlank(), "Generated token must not be blank");
    }

    @Test
    @DisplayName("Should extract the correct user ID from a valid token")
    void shouldExtractUserIdFromToken() {
        Long userId = 42L;
        String token = jwtProvider.generateToken(userId);

        Long extractedUserId = jwtProvider.getUserIdFromToken(token);

        assertEquals(userId, extractedUserId,
                "Extracted user ID must match the original");
    }

    @Test
    @DisplayName("Should validate a correctly signed token")
    void shouldValidateCorrectToken() {
        String token = jwtProvider.generateToken(1L);

        assertTrue(jwtProvider.validateToken(token),
                "A correctly signed token must be valid");
    }

    @Test
    @DisplayName("Should reject a tampered token")
    void shouldRejectTamperedToken() {
        String token = jwtProvider.generateToken(1L);
        String tamperedToken = token + "tampered";

        assertFalse(jwtProvider.validateToken(tamperedToken),
                "A tampered token must be rejected");
    }

    @Test
    @DisplayName("Should reject a completely invalid token string")
    void shouldRejectInvalidTokenString() {
        assertFalse(jwtProvider.validateToken("not.a.valid.jwt.token"),
                "An invalid token string must be rejected");
    }

    @Test
    @DisplayName("Should reject a null token")
    void shouldRejectNullToken() {
        assertFalse(jwtProvider.validateToken(null),
                "A null token must be rejected");
    }

    @Test
    @DisplayName("Should reject an empty token")
    void shouldRejectEmptyToken() {
        assertFalse(jwtProvider.validateToken(""),
                "An empty token must be rejected");
    }

    @Test
    @DisplayName("Should generate different tokens for different user IDs")
    void shouldGenerateDifferentTokensForDifferentUsers() {
        String token1 = jwtProvider.generateToken(1L);
        String token2 = jwtProvider.generateToken(2L);

        assertNotEquals(token1, token2,
                "Tokens for different users must be different");
    }

    @Test
    @DisplayName("Expired token should be rejected")
    void shouldRejectExpiredToken() {
        // Create a provider with 0ms expiration (instantly expired)
        JwtProvider shortLivedProvider = new JwtProvider(TEST_SECRET, 0);
        String token = shortLivedProvider.generateToken(1L);

        // Token generated with 0ms expiration should be invalid immediately
        assertFalse(shortLivedProvider.validateToken(token),
                "An expired token must be rejected");
    }
}
