package com.devrats.service;

import com.devrats.repository.ScoreRepository;
import com.devrats.security.HmacValidator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for WebhookService.
 *
 * Per spec section 3: "O GitHub enviará um Payload JSON via POST para a API
 * sempre que uma ação ocorrer."
 * Per spec section 4.1: HMAC validation is required on all webhooks.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Webhook Service - GitHub Event Processing")
class WebhookServiceTest {

    @Mock
    private HmacValidator hmacValidator;

    @Mock
    private ScoringService scoringService;

    @Mock
    private ScoreRepository scoreRepository;

    @InjectMocks
    private WebhookService webhookService;

    @Test
    @DisplayName("Should reject webhook with invalid HMAC signature")
    void shouldRejectInvalidHmacSignature() {
        String payload = "{\"action\":\"push\"}";
        String signature = "sha256=invalid";

        when(hmacValidator.isValid(payload, signature)).thenReturn(false);

        assertThrows(SecurityException.class,
                () -> webhookService.processWebhook(payload, signature),
                "Webhook with invalid HMAC signature must be rejected with SecurityException");
    }

    @Test
    @DisplayName("Should accept webhook with valid HMAC signature and process push")
    void shouldAcceptValidWebhook() {
        String payload = "{\"ref\":\"refs/heads/main\",\"commits\":[]}";
        String signature = "sha256=valid";

        when(hmacValidator.isValid(payload, signature)).thenReturn(true);

        assertDoesNotThrow(
                () -> webhookService.processWebhook(payload, signature),
                "Webhook with valid HMAC signature must be accepted");
    }
}
