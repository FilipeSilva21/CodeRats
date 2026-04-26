package com.devrats.features.auth

import com.devrats.features.auth.models.Users
import com.devrats.shared.security.JwtProvider
import com.devrats.shared.exceptions.UnauthorizedException
import kotlinx.datetime.Clock
import kotlin.time.Duration.Companion.milliseconds

class AuthService(private val repo: AuthRepository, private val jwt: JwtProvider) {

    fun findOrCreateUser(githubId: String, username: String, displayName: String, avatarUrl: String?): Map<String, Any?> {
        val existing = repo.findByGithubId(githubId)
        val userId = if (existing != null) existing[Users.id] else repo.createUser(githubId, username, displayName, avatarUrl)
        val accessToken = jwt.generateAccessToken(userId)
        val refreshToken = jwt.generateRefreshToken(userId)
        val expiresAt = Clock.System.now().plus(jwt.refreshExp.milliseconds)
        repo.saveRefreshToken(userId, refreshToken, expiresAt)
        val user = repo.findById(userId)!!
        return mapOf(
            "accessToken" to accessToken, "refreshToken" to refreshToken,
            "user" to mapOf("id" to user[Users.id], "username" to user[Users.username],
                "displayName" to user[Users.displayName], "avatarUrl" to user[Users.avatarUrl],
                "totalScore" to user[Users.totalScore], "currentStreak" to user[Users.currentStreak], "bestStreak" to user[Users.bestStreak])
        )
    }

    fun refreshAccessToken(refreshToken: String): Map<String, String> {
        val stored = repo.findRefreshToken(refreshToken) ?: throw UnauthorizedException("Invalid refresh token")
        val userId = stored[com.devrats.features.auth.models.RefreshTokens.userId]
        repo.deleteRefreshToken(refreshToken)
        val newAccess = jwt.generateAccessToken(userId)
        val newRefresh = jwt.generateRefreshToken(userId)
        val expiresAt = Clock.System.now().plus(jwt.refreshExp.milliseconds)
        repo.saveRefreshToken(userId, newRefresh, expiresAt)
        return mapOf("accessToken" to newAccess, "refreshToken" to newRefresh)
    }

    fun getProfile(userId: String): Map<String, Any?> {
        val user = repo.findById(userId) ?: throw UnauthorizedException("User not found")
        return mapOf("id" to user[Users.id], "username" to user[Users.username],
            "displayName" to user[Users.displayName], "avatarUrl" to user[Users.avatarUrl],
            "totalScore" to user[Users.totalScore], "currentStreak" to user[Users.currentStreak], "bestStreak" to user[Users.bestStreak])
    }
}
