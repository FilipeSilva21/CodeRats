package com.devrats.features.auth.models

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.kotlin.datetime.timestamp
import kotlinx.datetime.Clock

object Users : Table("users") {
    val id = varchar("id", 36)
    val githubId = varchar("github_id", 50).uniqueIndex()
    val username = varchar("username", 100)
    val displayName = varchar("display_name", 200)
    val avatarUrl = varchar("avatar_url", 500).nullable()
    val totalScore = integer("total_score").default(0)
    val currentStreak = integer("current_streak").default(0)
    val bestStreak = integer("best_streak").default(0)
    val lastCommitDate = varchar("last_commit_date", 20).nullable()
    val league = varchar("league", 20).default("BRONZE")
    val createdAt = timestamp("created_at").defaultExpression(org.jetbrains.exposed.sql.kotlin.datetime.CurrentTimestamp)
    override val primaryKey = PrimaryKey(id)
}

object RefreshTokens : Table("refresh_tokens") {
    val id = varchar("id", 36)
    val userId = varchar("user_id", 36).references(Users.id)
    val token = varchar("token", 500).uniqueIndex()
    val expiresAt = timestamp("expires_at")
    val createdAt = timestamp("created_at").defaultExpression(org.jetbrains.exposed.sql.kotlin.datetime.CurrentTimestamp)
    override val primaryKey = PrimaryKey(id)
}

fun org.jetbrains.exposed.sql.ResultRow.getEffectiveStreak(): Int {
    val currentStreak = this[Users.currentStreak]
    if (currentStreak == 0) return 0
    val lastCommit = this[Users.lastCommitDate] ?: return 0
    
    val today = java.time.LocalDate.now()
    val lastDate = java.time.LocalDate.parse(lastCommit)
    val daysBetween = java.time.temporal.ChronoUnit.DAYS.between(lastDate, today)
    
    return if (daysBetween <= 1) currentStreak else 0
}
