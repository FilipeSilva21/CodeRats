package com.devrats.features.scoring

import com.devrats.features.scoring.models.Scores
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID

class ScoringRepository {
    init { transaction { SchemaUtils.create(Scores) } }

    fun addScore(userId: String, points: Int, source: String, commitHash: String?) = transaction {
        Scores.insert {
            it[Scores.id] = UUID.randomUUID().toString(); it[Scores.userId] = userId
            it[Scores.points] = points; it[Scores.scoreSource] = source; it[Scores.commitHash] = commitHash
        }
        
        // Update user's total score
        val currentUser = com.devrats.features.auth.models.Users.selectAll()
            .where { com.devrats.features.auth.models.Users.id eq userId }
            .singleOrNull()
            
        if (currentUser != null) {
            val currentTotal = currentUser[com.devrats.features.auth.models.Users.totalScore]
            val lastCommit = currentUser[com.devrats.features.auth.models.Users.lastCommitDate]
            val today = java.time.LocalDate.now().toString()
            
            var newStreak = currentUser[com.devrats.features.auth.models.Users.currentStreak]
            var newBestStreak = currentUser[com.devrats.features.auth.models.Users.bestStreak]
            
            if (lastCommit != today) {
                if (lastCommit == java.time.LocalDate.now().minusDays(1).toString()) {
                    newStreak += 1
                } else {
                    newStreak = 1
                }
                if (newStreak > newBestStreak) newBestStreak = newStreak
            }

            com.devrats.features.auth.models.Users.update({ com.devrats.features.auth.models.Users.id eq userId }) {
                it[totalScore] = currentTotal + points
                it[currentStreak] = newStreak
                it[bestStreak] = newBestStreak
                it[lastCommitDate] = today
            }
        }
    }

    fun getTodayScores(userId: String): Int = transaction {
        val today = java.time.LocalDate.now().toString()
        Scores.selectAll().where { (Scores.userId eq userId) }
            .sumOf { it[Scores.points] }
    }

    fun getRecentScores(userId: String, limit: Int = 10) = transaction {
        Scores.selectAll().where { Scores.userId eq userId }
            .orderBy(Scores.scoredAt, SortOrder.DESC).limit(limit).toList()
    }

    fun commitExists(commitHash: String) = transaction {
        Scores.selectAll().where { Scores.commitHash eq commitHash }.count() > 0
    }
}
