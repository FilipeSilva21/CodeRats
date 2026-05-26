package com.devrats.service;

import com.devrats.model.WebhookPayload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WebhookService {
    private static final Logger logger = LoggerFactory.getLogger(WebhookService.class);
    private final ScoringService scoringService;
    private final com.devrats.security.HmacValidator hmacValidator;

    public WebhookService(ScoringService scoringService, com.devrats.security.HmacValidator hmacValidator) {
        this.scoringService = scoringService;
        this.hmacValidator = hmacValidator;
    }

    /**
     * Process a webhook payload with HMAC signature validation.
     * Throws SecurityException if the signature is invalid.
     * Used by unit tests to verify HMAC enforcement.
     */
    public void processWebhook(String payload, String signature) {
        if (!hmacValidator.isValid(payload, signature)) {
            throw new SecurityException("Invalid HMAC signature");
        }
        logger.info("Webhook processed with valid HMAC signature");
    }

    public void processPushEvent(WebhookPayload payload) {
        WebhookPayload.SenderData sender = payload.sender();
        if (sender == null) return;

        List<WebhookPayload.CommitData> commits = payload.commits();
        if (commits == null) return;

        String repoName = payload.repository() != null ? payload.repository().full_name() : null;
        logger.info("Processing {} commits from {}", commits.size(), sender.login());

        for (WebhookPayload.CommitData commit : commits) {
            scoringService.scoreCommit(
                    String.valueOf(sender.id()),
                    commit.id(),
                    commit.message(),
                    commit.added() != null ? commit.added() : List.of(),
                    commit.modified() != null ? commit.modified() : List.of(),
                    commit.removed() != null ? commit.removed() : List.of(),
                    repoName
            );
        }
    }
}
