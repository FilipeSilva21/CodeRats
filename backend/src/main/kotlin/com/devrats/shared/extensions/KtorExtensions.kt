package com.devrats.shared.extensions

import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.routing.*

fun RoutingCall.userId(): String {
    val principal = authentication.principal<JWTPrincipal>()
    return principal?.payload?.getClaim("userId")?.asString()
        ?: throw com.devrats.shared.exceptions.UnauthorizedException("Invalid token")
}
