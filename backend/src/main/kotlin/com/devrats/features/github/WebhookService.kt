package com.devrats.features.github

import com.devrats.features.github.models.WebhookPayload
import com.devrats.features.scoring.ScoringService
import org.slf4j.LoggerFactory

class WebhookService(private val scoringService: ScoringService) {
    private val logger = LoggerFactory.getLogger(WebhookService::class.java)

    fun processPushEvent(payload: WebhookPayload) {
        val sender = payload.sender ?: return
        val commits = payload.commits ?: return
        logger.info("Processing ${commits.size} commits from ${sender.login}")
        for (commit in commits) {
            scoringService.scoreCommit(sender.id.toString(), commit)
        }
    }
}
