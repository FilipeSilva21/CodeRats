package com.devrats.integration;

import com.devrats.security.HmacValidator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for the Webhook endpoint.
 *
 * Per spec section 4.1: The webhook endpoint must validate HMAC signatures.
 * Per README: POST /api/webhooks/github with HMAC authentication.
 *
 * These tests verify the full HTTP request/response cycle including
 * security filters, HMAC validation, and proper HTTP status codes.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Integration: Webhook Endpoint Security")
class WebhookIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private static final String WEBHOOK_SECRET = "test-webhook-secret";
    private static final String WEBHOOK_URL = "/api/webhooks/github";

    @Test
    @DisplayName("POST /api/webhooks/github should reject request without signature header")
    void shouldRejectWebhookWithoutSignature() throws Exception {
        String payload = "{\"ref\":\"refs/heads/main\",\"commits\":[]}";

        mockMvc.perform(post(WEBHOOK_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/webhooks/github should reject request with invalid signature")
    void shouldRejectWebhookWithInvalidSignature() throws Exception {
        String payload = "{\"ref\":\"refs/heads/main\",\"commits\":[]}";

        mockMvc.perform(post(WEBHOOK_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-Hub-Signature-256", "sha256=invalid_signature")
                        .content(payload))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/webhooks/github should accept request with valid HMAC signature")
    void shouldAcceptWebhookWithValidSignature() throws Exception {
        String payload = "{\"ref\":\"refs/heads/main\",\"commits\":[],\"sender\":{\"login\":\"testuser\"}}";
        String signature = "sha256=" + computeHmac(payload, WEBHOOK_SECRET);

        mockMvc.perform(post(WEBHOOK_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-Hub-Signature-256", signature)
                        .content(payload))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/webhooks/github should reject empty payload")
    void shouldRejectEmptyPayload() throws Exception {
        mockMvc.perform(post(WEBHOOK_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-Hub-Signature-256", "sha256=something")
                        .content(""))
                .andExpect(status().isBadRequest());
    }

    /**
     * Helper: compute HMAC-SHA256 hex digest.
     */
    private String computeHmac(String payload, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec keySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(keySpec);
        byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
