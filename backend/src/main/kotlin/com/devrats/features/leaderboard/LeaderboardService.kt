package com.devrats.features.leaderboard

import com.devrats.features.auth.models.Users
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

class LeaderboardService {
    fun getGlobalLeaderboard(limit: Int = 50) = transaction {
        Users.selectAll().orderBy(Users.totalScore, SortOrder.DESC).limit(limit).mapIndexed { index, row ->
            mapOf("rank" to index + 1, "userId" to row[Users.id], "username" to row[Users.username],
                "displayName" to row[Users.displayName], "avatarUrl" to row[Users.avatarUrl],
                "totalScore" to row[Users.totalScore], "currentStreak" to row[Users.currentStreak])
        }
    }
}
