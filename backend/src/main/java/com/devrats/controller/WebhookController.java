package com.devrats.controller;

import com.devrats.model.WebhookPayload;
import com.devrats.security.HmacValidator;
import com.devrats.service.WebhookService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {
    private static final Logger logger = LoggerFactory.getLogger(WebhookController.class);
    private final WebhookService webhookService;
    private final HmacValidator hmacValidator;
    private final ObjectMapper objectMapper;

    public WebhookController(WebhookService webhookService, HmacValidator hmacValidator, ObjectMapper objectMapper) {
        this.webhookService = webhookService;
        this.hmacValidator = hmacValidator;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/github")
    public ResponseEntity<?> handleGithubWebhook(
            @RequestBody byte[] rawBody,
            @RequestHeader(value = "X-Hub-Signature-256", required = false) String signature,
            @RequestHeader(value = "X-GitHub-Event", required = false) String event) {

        logger.info("Received GitHub Webhook Event: {}", event);

        if (signature == null || !hmacValidator.isValid(rawBody, signature)) {
            logger.warn("Webhook signature validation failed! Signature header: {}", signature);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid signature");
        }

        String body = new String(rawBody, StandardCharsets.UTF_8);

        if (event == null) event = "";

        switch (event) {
            case "push":
                try {
                    String jsonString = body;
                    if (body.startsWith("payload=")) {
                        String encoded = body.substring(8);
                        jsonString = URLDecoder.decode(encoded, StandardCharsets.UTF_8);
                    }
                    WebhookPayload payload = objectMapper.readValue(jsonString, WebhookPayload.class);
                    webhookService.processPushEvent(payload);
                    return ResponseEntity.ok(Map.of("status", "processed"));
                } catch (Exception e) {
                    logger.error("Failed to parse webhook payload", e);
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid payload format"));
                }
            case "ping":
                return ResponseEntity.ok(Map.of("status", "pong"));
            default:
                logger.info("Ignoring unhandled event type: {}", event);
                return ResponseEntity.ok(Map.of("status", "ignored"));
        }
    }
}
