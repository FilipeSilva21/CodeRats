package com.devrats.features.scoring

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
                        mapOf("id" to it[com.devrats.features.scoring.models.Scores.id],
                            "points" to it[com.devrats.features.scoring.models.Scores.points],
                            "source" to it[com.devrats.features.scoring.models.Scores.scoreSource])
                    }
                    call.respond(mapOf("recentScores" to recent, "totalScore" to 0, "todayScore" to 0,
                        "currentStreak" to 0, "bestStreak" to 0, "streakBonus" to 0))
                }
                get("/me/daily") {
                    val uid = call.userId()
                    val total = repo.getTodayScores(uid)
                    call.respond(mapOf("totalPoints" to total, "commitCount" to 0, "dailyCap" to 200, "capped" to (total >= 200)))
                }
            }
        }
    }
}
