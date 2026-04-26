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
                call.respond(service.getGlobalLeaderboard(limit))
            }
        }
    }
}
