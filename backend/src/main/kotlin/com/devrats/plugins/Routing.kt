package com.devrats.plugins

import com.devrats.features.auth.authRoutes
import com.devrats.features.github.webhookRoutes
import com.devrats.features.scoring.scoringRoutes
import com.devrats.features.squad.squadRoutes
import com.devrats.features.leaderboard.leaderboardRoutes
import com.devrats.features.leaderboard.leaderboardWebSocket
import com.devrats.shared.exceptions.AppException
import io.ktor.server.application.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*

fun Application.configureRouting() {
    install(StatusPages) {
        exception<AppException> { call, cause ->
            call.respond(HttpStatusCode.fromValue(cause.statusCode), mapOf("error" to cause.message))
        }
        exception<Throwable> { call, cause ->
            call.respond(HttpStatusCode.InternalServerError, mapOf("error" to (cause.message ?: "Internal error")))
        }
    }

    routing {
        get("/api/health") {
            call.respond(HttpStatusCode.OK, mapOf("status" to "ok", "service" to "devrats-api"))
        }
    }

    authRoutes()
    webhookRoutes()
    scoringRoutes()
    squadRoutes()
    leaderboardRoutes()
    leaderboardWebSocket()
}
