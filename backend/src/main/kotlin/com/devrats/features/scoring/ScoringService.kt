package com.devrats.features.scoring

import com.devrats.features.github.models.CommitData
import org.slf4j.LoggerFactory

import com.devrats.shared.websocket.ConnectionManager
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq

class ScoringService(private val repo: ScoringRepository, private val connectionManager: ConnectionManager) {
    private val logger = LoggerFactory.getLogger(ScoringService::class.java)
    private val dailyCap = 200

    @OptIn(DelicateCoroutinesApi::class)
    fun scoreCommit(githubUserId: String, commit: CommitData) {
        if (repo.commitExists(commit.id)) { logger.debug("Duplicate commit: ${commit.id}"); return }
        if (commit.message.startsWith("Merge ")) { logger.debug("Skipping merge commit"); return }
        if (commit.message.isBlank()) { logger.debug("Skipping empty commit message"); return }

        val filesChanged = commit.added.size + commit.modified.size + commit.removed.size
        if (filesChanged == 0) { logger.debug("Skipping commit with no file changes"); return }

        // Find internal user id from githubId
        val internalUser = transaction { 
            com.devrats.features.auth.models.Users.selectAll()
                .where { com.devrats.features.auth.models.Users.githubId eq githubUserId }
                .singleOrNull()
        }
        
        if (internalUser == null) {
            logger.debug("Skipping commit for unknown github user: $githubUserId")
            return
        }
        
        val userId = internalUser[com.devrats.features.auth.models.Users.id]

        val todayTotal = repo.getTodayScores(userId)
        if (todayTotal >= dailyCap) { logger.info("Daily cap reached for $githubUserId"); return }

        var points = 10
        val mdOnly = (commit.added + commit.modified).all { it.endsWith(".md") }
        if (mdOnly) points = 2

        val remaining = dailyCap - todayTotal
        points = minOf(points, remaining)

        repo.addScore(userId, points, "push", commit.id)
        logger.info("Scored $points pts for commit ${commit.id.take(7)} by $githubUserId (internal $userId)")
        
        val totalScore = transaction {
             com.devrats.features.auth.models.Users.selectAll()
                .where { com.devrats.features.auth.models.Users.id eq userId }
                .singleOrNull()?.get(com.devrats.features.auth.models.Users.totalScore) ?: 0
        }

        GlobalScope.launch {
            connectionManager.broadcastScoreUpdate(userId, totalScore, points)
        }
    }
}
