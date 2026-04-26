package com.devrats.features.squad

import com.devrats.shared.extensions.userId
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*
import org.koin.ktor.ext.inject

fun Application.squadRoutes() {
    val service by inject<SquadService>()
    routing {
        authenticate("auth-jwt") {
            route("/api/squads") {
                get("/my") { call.respond(service.getMySquads(call.userId())) }
                get("/{id}") {
                    val id = call.parameters["id"] ?: return@get call.respond(HttpStatusCode.BadRequest)
                    call.respond(service.getDetails(id))
                }
                post {
                    val body = call.receive<Map<String, String>>()
                    call.respond(HttpStatusCode.Created, service.create(body["name"]!!, call.userId()))
                }
                post("/join") {
                    val body = call.receive<Map<String, String>>()
                    call.respond(service.joinByCode(body["inviteCode"]!!, call.userId()))
                }
            }
        }
    }
}
