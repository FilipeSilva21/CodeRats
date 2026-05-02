package com.devrats.features.scoring.models

import kotlinx.serialization.Serializable

@Serializable
data class RecentScoreResponse(
    val id: String,
    val points: Int,
    val source: String,
    val commitHash: String? = null,
    val scoredAt: String? = null
)

@Serializable
data class ScoreSummaryResponse(
    val recentScores: List<RecentScoreResponse>,
    val totalScore: Int,
    val todayScore: Int,
    val currentStreak: Int,
    val bestStreak: Int,
    val streakBonus: Int
)

@Serializable
data class DailyScoreResponse(
    val totalPoints: Int,
    val commitCount: Int,
    val dailyCap: Int,
    val capped: Boolean
)
