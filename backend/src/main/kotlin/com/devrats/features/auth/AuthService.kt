package com.devrats.features.auth

import com.devrats.features.auth.models.Users
import com.devrats.features.auth.models.AuthResponse
import com.devrats.features.auth.models.UserProfile
import com.devrats.features.auth.models.TokenRefreshResponse
import com.devrats.shared.security.JwtProvider
import com.devrats.shared.exceptions.UnauthorizedException
import kotlinx.datetime.Clock
import kotlin.time.Duration.Companion.milliseconds

class AuthService(private val repo: AuthRepository, private val jwt: JwtProvider) {

    fun findOrCreateUser(githubId: String, username: String, displayName: String, avatarUrl: String?): AuthResponse {
        val existing = repo.findByGithubId(githubId)
        val userId = if (existing != null) existing[Users.id] else repo.createUser(githubId, username, displayName, avatarUrl)
        val accessToken = jwt.generateAccessToken(userId)
        val refreshToken = jwt.generateRefreshToken(userId)
        val expiresAt = Clock.System.now().plus(jwt.refreshExp.milliseconds)
        repo.saveRefreshToken(userId, refreshToken, expiresAt)
        val user = repo.findById(userId)!!
        return AuthResponse(
            accessToken = accessToken, 
            refreshToken = refreshToken,
            user = UserProfile(
                id = user[Users.id], 
                username = user[Users.username],
                displayName = user[Users.displayName], 
                avatarUrl = user[Users.avatarUrl],
                totalScore = user[Users.totalScore], 
                currentStreak = user[Users.currentStreak], 
                bestStreak = user[Users.bestStreak]
            )
        )
    }

    fun refreshAccessToken(refreshToken: String): TokenRefreshResponse {
        val stored = repo.findRefreshToken(refreshToken) ?: throw UnauthorizedException("Invalid refresh token")
        val userId = stored[com.devrats.features.auth.models.RefreshTokens.userId]
        repo.deleteRefreshToken(refreshToken)
        val newAccess = jwt.generateAccessToken(userId)
        val newRefresh = jwt.generateRefreshToken(userId)
        val expiresAt = Clock.System.now().plus(jwt.refreshExp.milliseconds)
        repo.saveRefreshToken(userId, newRefresh, expiresAt)
        return TokenRefreshResponse(accessToken = newAccess, refreshToken = newRefresh)
    }

    fun getProfile(userId: String): UserProfile {
        val user = repo.findById(userId) ?: throw UnauthorizedException("User not found")
        return UserProfile(
            id = user[Users.id], 
            username = user[Users.username],
            displayName = user[Users.displayName], 
            avatarUrl = user[Users.avatarUrl],
            totalScore = user[Users.totalScore], 
            currentStreak = user[Users.currentStreak], 
            bestStreak = user[Users.bestStreak]
        )
    }
}
