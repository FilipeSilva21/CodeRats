package com.devrats.shared.websocket

import io.ktor.websocket.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.*
import kotlin.collections.LinkedHashSet

@Serializable
data class ScoreUpdateMessage(
    val type: String = "SCORE_UPDATED",
    val userId: String,
    val newTotalScore: Int,
    val pointsAdded: Int
)

class ConnectionManager {
    val connections = Collections.synchronizedSet<WebSocketSession>(LinkedHashSet())

    fun addConnection(session: WebSocketSession) {
        connections.add(session)
    }

    fun removeConnection(session: WebSocketSession) {
        connections.remove(session)
    }

    suspend fun broadcastScoreUpdate(userId: String, newTotalScore: Int, pointsAdded: Int) {
        val payload = ScoreUpdateMessage(
            userId = userId,
            newTotalScore = newTotalScore,
            pointsAdded = pointsAdded
        )
        val jsonPayload = Json.encodeToString(payload)
        connections.forEach { session ->
            try {
                session.send(Frame.Text(jsonPayload))
            } catch (e: Exception) {
                // Ignore, connection will be removed on next tick
            }
        }
    }
}
