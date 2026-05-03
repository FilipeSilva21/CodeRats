package com.devrats.features.leaderboard

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.koin.ktor.ext.inject

fun Application.leaderboardRoutes() {
    val service by inject<LeaderboardService>()
    routing {
        route("/api/leaderboard") {
            get("/global") {
                val limit = call.parameters["limit"]?.toIntOrNull() ?: 50
                val league = call.parameters["league"]
                call.respond(service.getGlobalLeaderboard(limit, league))
            }
            
            post("/admin/process-leagues") {
                // In a real app this should be protected by admin auth
                val leagueService = com.devrats.features.scoring.services.LeagueService()
                leagueService.processWeeklyLeagues()
                call.respond(mapOf("success" to true, "message" to "Leagues processed"))
            }
        }
    }
}
