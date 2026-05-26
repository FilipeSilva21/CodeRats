package com.devrats.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Component
public class HmacValidator {

    private final String secret;

    public HmacValidator(@Value("${github.webhookSecret}") String secret) {
        this.secret = secret;
    }

    /**
     * Validate HMAC-SHA256 signature using String payload.
     * Rejects null/empty payloads and null/empty/malformed signatures.
     */
    public boolean isValid(String payload, String signatureHeader) {
        if (payload == null || payload.isEmpty()) {
            return false;
        }
        return isValidBytes(payload.getBytes(StandardCharsets.UTF_8), signatureHeader);
    }

    /**
     * Validate HMAC-SHA256 signature using raw byte[] payload.
     * This is the core validation method used by the webhook controller.
     */
    public boolean isValidPayload(byte[] payload, String signatureHeader) {
        if (payload == null || payload.length == 0) {
            return false;
        }
        return isValidBytes(payload, signatureHeader);
    }

    private boolean isValidBytes(byte[] payload, String signatureHeader) {
        if (signatureHeader == null || signatureHeader.isEmpty() || !signatureHeader.startsWith("sha256=")) {
            System.out.println("[DEBUG HMAC] Signature header is null or doesn't start with sha256=");
            return false;
        }

        String signature = signatureHeader.substring(7);
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(payload);
            String computedSignature = bytesToHex(hmacBytes);
            
            if (!computedSignature.equals(signature)) {
                System.out.println("[DEBUG HMAC] Validation FAILED.");
                System.out.println("[DEBUG HMAC] GitHub sent: " + signature);
                System.out.println("[DEBUG HMAC] We computed: " + computedSignature);
                System.out.println("[DEBUG HMAC] Using secret: '" + secret + "' (length: " + secret.length() + ")");
                return false;
            }
            return true;
        } catch (Exception e) {
            System.out.println("[DEBUG HMAC] Exception during validation: " + e.getMessage());
            return false;
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
