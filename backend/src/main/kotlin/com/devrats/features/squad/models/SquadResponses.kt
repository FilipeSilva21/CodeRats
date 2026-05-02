package com.devrats.features.squad.models

import kotlinx.serialization.Serializable

@Serializable
data class SquadResponse(
    val id: String,
    val name: String,
    val description: String?,
    val imageUrl: String?,
    val inviteCode: String,
    val ownerId: String,
    val maxMembers: Int,
    val memberCount: Int
)

@Serializable
data class SquadMemberResponse(
    val userId: String,
    val username: String,
    val displayName: String,
    val avatarUrl: String?,
    val role: String,
    val totalScore: Int
)

@Serializable
data class SquadDetailsResponse(
    val squad: SquadResponse,
    val members: List<SquadMemberResponse>
)

@Serializable
data class UpdateSquadRequest(
    val name: String? = null,
    val description: String? = null,
    val imageUrl: String? = null
)
