package com.devrats.features.github

import com.devrats.features.github.models.WebhookPayload
import com.devrats.shared.security.HmacValidator
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*
import org.koin.ktor.ext.inject
import java.net.URLDecoder

fun Application.webhookRoutes() {
    val webhookService by inject<WebhookService>()
    val hmacValidator by inject<HmacValidator>()
    routing {
        route("/api/webhooks") {
            post("/github") {
                val body = call.receiveText()
                val signature = call.request.header("X-Hub-Signature-256")
                if (!hmacValidator.isValid(body.toByteArray(), signature)) {
                    call.respond(HttpStatusCode.Unauthorized, "Invalid signature")
                    return@post
                }
                val event = call.request.header("X-GitHub-Event") ?: ""
                when (event) {
                    "push" -> {
                        try {
                            var jsonString = body
                            if (body.startsWith("payload=")) {
                                val encoded = body.removePrefix("payload=")
                                jsonString = URLDecoder.decode(encoded, "UTF-8")
                            }
                            val payload = kotlinx.serialization.json.Json { ignoreUnknownKeys = true }
                                .decodeFromString<WebhookPayload>(jsonString)
                            webhookService.processPushEvent(payload)
                            call.respond(HttpStatusCode.OK, mapOf("status" to "processed"))
                        } catch (e: Exception) {
                            call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Invalid payload format"))
                        }
                    }
                    "ping" -> call.respond(HttpStatusCode.OK, mapOf("status" to "pong"))
                    else -> call.respond(HttpStatusCode.OK, mapOf("status" to "ignored"))
                }
            }
        }
    }
}
