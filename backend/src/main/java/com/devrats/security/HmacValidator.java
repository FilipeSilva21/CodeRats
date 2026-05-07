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

    public boolean isValid(byte[] payload, String signatureHeader) {
        if (signatureHeader == null || !signatureHeader.startsWith("sha256=")) {
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
