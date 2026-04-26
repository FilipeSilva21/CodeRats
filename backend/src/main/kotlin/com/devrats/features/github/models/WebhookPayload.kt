package com.devrats.features.github.models

import kotlinx.serialization.Serializable

@Serializable
data class WebhookPayload(
    val ref: String? = null,
    val commits: List<CommitData>? = null,
    val sender: SenderData? = null,
    val repository: RepoData? = null,
    val installation: InstallationRef? = null
)

@Serializable
data class CommitData(
    val id: String,
    val message: String,
    val timestamp: String,
    val author: AuthorData? = null,
    val added: List<String> = emptyList(),
    val removed: List<String> = emptyList(),
    val modified: List<String> = emptyList()
)

@Serializable
data class AuthorData(val name: String? = null, val email: String? = null, val username: String? = null)

@Serializable
data class SenderData(val id: Long, val login: String, val avatar_url: String? = null)

@Serializable
data class RepoData(val id: Long, val name: String, val full_name: String, val private: Boolean = false)

@Serializable
data class InstallationRef(val id: Long)
