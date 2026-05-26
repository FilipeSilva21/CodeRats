package com.devrats.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for HmacValidator.
 *
 * Per spec section 4.1: "Toda requisição recebida no endpoint /webhooks será validada
 * utilizando criptografia HMAC (x-hub-signature-256) comparando o JSON recebido com
 * o Secret cadastrado no GitHub. Requisições sem a assinatura correta serão descartadas."
 *
 * These tests verify the webhook signature validation mechanism that protects
 * the system from forged webhook payloads.
 */
@DisplayName("HMAC Validator - Webhook Security")
class HmacValidatorTest {

    private HmacValidator hmacValidator;
    private static final String TEST_SECRET = "test-webhook-secret";

    @BeforeEach
    void setUp() {
        hmacValidator = new HmacValidator(TEST_SECRET);
    }

    @Test
    @DisplayName("Should accept a valid HMAC-SHA256 signature")
    void shouldAcceptValidSignature() throws Exception {
        String payload = "{\"action\":\"push\",\"commits\":[]}";
        String signature = "sha256=" + computeHmac(payload, TEST_SECRET);

        assertTrue(hmacValidator.isValid(payload, signature),
                "A valid HMAC signature must be accepted");
    }

    @Test
    @DisplayName("Should reject an invalid HMAC-SHA256 signature")
    void shouldRejectInvalidSignature() {
        String payload = "{\"action\":\"push\",\"commits\":[]}";
        String fakeSignature = "sha256=invalid_signature_here";

        assertFalse(hmacValidator.isValid(payload, fakeSignature),
                "An invalid HMAC signature must be rejected");
    }

    @Test
    @DisplayName("Should reject when signature header is null")
    void shouldRejectNullSignature() {
        String payload = "{\"action\":\"push\",\"commits\":[]}";

        assertFalse(hmacValidator.isValid(payload, null),
                "A null signature must be rejected");
    }

    @Test
    @DisplayName("Should reject when signature header is empty")
    void shouldRejectEmptySignature() {
        String payload = "{\"action\":\"push\",\"commits\":[]}";

        assertFalse(hmacValidator.isValid(payload, ""),
                "An empty signature must be rejected");
    }

    @Test
    @DisplayName("Should reject when payload is empty")
    void shouldRejectEmptyPayload() {
        assertFalse(hmacValidator.isValid("", "sha256=something"),
                "An empty payload must be rejected");
    }

    @Test
    @DisplayName("Should reject when payload is null")
    void shouldRejectNullPayload() {
        assertFalse(hmacValidator.isValid(null, "sha256=something"),
                "A null payload must be rejected");
    }

    @Test
    @DisplayName("Should reject signature without sha256= prefix")
    void shouldRejectSignatureWithoutPrefix() throws Exception {
        String payload = "{\"action\":\"push\"}";
        String signatureWithoutPrefix = computeHmac(payload, TEST_SECRET);

        assertFalse(hmacValidator.isValid(payload, signatureWithoutPrefix),
                "Signature without sha256= prefix must be rejected");
    }

    @Test
    @DisplayName("Should reject signature computed with wrong secret")
    void shouldRejectSignatureWithWrongSecret() throws Exception {
        String payload = "{\"action\":\"push\",\"commits\":[]}";
        String signatureWithWrongSecret = "sha256=" + computeHmac(payload, "wrong-secret");

        assertFalse(hmacValidator.isValid(payload, signatureWithWrongSecret),
                "Signature computed with wrong secret must be rejected");
    }

    /**
     * Helper: compute HMAC-SHA256 hex digest for testing.
     */
    private String computeHmac(String payload, String secret) throws NoSuchAlgorithmException, InvalidKeyException {
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
