package com.devrats.features.leaderboard

import com.devrats.features.auth.models.Users
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

@Serializable
data class LeaderboardEntry(
    val rank: Int,
    val userId: String,
    val username: String,
    val displayName: String,
    val avatarUrl: String?,
    val totalScore: Int,
    val currentStreak: Int
)

class LeaderboardService {
    fun getGlobalLeaderboard(limit: Int = 50): List<LeaderboardEntry> = transaction {
        Users.selectAll().orderBy(Users.totalScore, SortOrder.DESC).limit(limit).mapIndexed { index, row ->
            LeaderboardEntry(
                rank = index + 1,
                userId = row[Users.id],
                username = row[Users.username],
                displayName = row[Users.displayName],
                avatarUrl = row[Users.avatarUrl],
                totalScore = row[Users.totalScore],
                currentStreak = row[Users.currentStreak]
            )
        }
    }
}
