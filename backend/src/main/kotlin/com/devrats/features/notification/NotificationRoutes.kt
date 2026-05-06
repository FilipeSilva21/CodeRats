package com.devrats.features.notification

import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.HttpStatusCode
import org.koin.ktor.ext.inject
import io.ktor.server.auth.jwt.JWTPrincipal

fun Routing.notificationRoutes() {
    val service by inject<NotificationService>()

    authenticate("auth-jwt") {
        route("/api/notifications") {
            get {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.payload?.getClaim("userId")?.asString()
                
                if (userId == null) {
                    call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Invalid token"))
                    return@get
                }

                val notifications = service.getUserNotifications(userId)
                call.respond(HttpStatusCode.OK, mapOf("data" to notifications))
            }

            post("/{id}/read") {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal?.payload?.getClaim("userId")?.asString()
                
                if (userId == null) {
                    call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Invalid token"))
                    return@post
                }

                val notificationId = call.parameters["id"] ?: return@post call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Missing id"))
                
                service.markAsRead(notificationId, userId)
                call.respond(HttpStatusCode.OK, mapOf("status" to "ok"))
            }
        }
    }
}
