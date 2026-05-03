package com.devrats.features.auth.models

import kotlinx.serialization.Serializable

@Serializable
data class UserProfile(
    val id: String,
    val username: String,
    val displayName: String,
    val avatarUrl: String?,
    val totalScore: Int,
    val currentStreak: Int,
    val bestStreak: Int,
    val league: String
)

@Serializable
data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val user: UserProfile
)

@Serializable
data class TokenRefreshResponse(
    val accessToken: String,
    val refreshToken: String
)
