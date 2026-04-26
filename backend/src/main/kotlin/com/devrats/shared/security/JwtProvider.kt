package com.devrats.shared.security

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import java.util.Date

class JwtProvider(
    val secret: String,
    val issuer: String,
    val audience: String,
    val realm: String,
    val exp: Long,
    val refreshExp: Long
) {
    private val algorithm = Algorithm.HMAC256(secret)

    fun buildVerifier() = JWT.require(algorithm).withIssuer(issuer).build()

    fun generateAccessToken(userId: String): String = JWT.create()
        .withIssuer(issuer)
        .withAudience(audience)
        .withClaim("userId", userId)
        .withExpiresAt(Date(System.currentTimeMillis() + exp))
        .sign(algorithm)

    fun generateRefreshToken(userId: String): String = JWT.create()
        .withIssuer(issuer)
        .withClaim("userId", userId)
        .withClaim("type", "refresh")
        .withExpiresAt(Date(System.currentTimeMillis() + refreshExp))
        .sign(algorithm)
}
