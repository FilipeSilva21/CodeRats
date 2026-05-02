package com.devrats.features.scoring

import com.devrats.features.scoring.models.RecentScoreResponse
import com.devrats.features.scoring.models.ScoreSummaryResponse
import com.devrats.features.scoring.models.DailyScoreResponse
import com.devrats.shared.extensions.userId
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.koin.ktor.ext.inject

fun Application.scoringRoutes() {
    val repo by inject<ScoringRepository>()
    routing {
        authenticate("auth-jwt") {
            route("/api/scores") {
                get("/me") {
                    val uid = call.userId()
                    val recent = repo.getRecentScores(uid).map {
                        RecentScoreResponse(
                            id = it[com.devrats.features.scoring.models.Scores.id],
                            points = it[com.devrats.features.scoring.models.Scores.points],
                            source = it[com.devrats.features.scoring.models.Scores.scoreSource]
                        )
                    }
                    val todayScore = repo.getTodayScores(uid)
                    call.respond(ScoreSummaryResponse(
                        recentScores = recent, 
                        totalScore = 0, 
                        todayScore = todayScore,
                        currentStreak = 0, 
                        bestStreak = 0, 
                        streakBonus = 0
                    ))
                }
                get("/me/daily") {
                    val uid = call.userId()
                    val total = repo.getTodayScores(uid)
                    call.respond(DailyScoreResponse(
                        totalPoints = total, 
                        commitCount = 0, 
                        dailyCap = 200, 
                        capped = total >= 200
                    ))
                }
            }
        }
    }
}
