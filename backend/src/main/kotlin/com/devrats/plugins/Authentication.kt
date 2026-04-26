package com.devrats.plugins

import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import com.devrats.shared.security.JwtProvider
import org.koin.ktor.ext.inject

fun Application.configureAuthentication() {
    val jwtProvider by inject<JwtProvider>()
    install(Authentication) {
        jwt("auth-jwt") {
            verifier(jwtProvider.buildVerifier())
            validate { credential ->
                if (credential.payload.getClaim("userId").asString() != "") {
                    JWTPrincipal(credential.payload)
                } else null
            }
        }
    }
}
