package com.devrats.features.github.models

import kotlinx.serialization.Serializable

@Serializable
data class Installation(val id: Long, val appId: Long, val targetType: String = "User")
