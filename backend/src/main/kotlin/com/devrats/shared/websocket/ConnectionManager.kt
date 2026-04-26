package com.devrats.shared.websocket

import io.ktor.websocket.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.*
import kotlin.collections.LinkedHashSet

class ConnectionManager {
    val connections = Collections.synchronizedSet<WebSocketSession>(LinkedHashSet())

    fun addConnection(session: WebSocketSession) {
        connections.add(session)
    }

    fun removeConnection(session: WebSocketSession) {
        connections.remove(session)
    }

    suspend fun broadcastScoreUpdate(userId: String, newTotalScore: Int, pointsAdded: Int) {
        val payload = mapOf(
            "type" to "SCORE_UPDATED",
            "userId" to userId,
            "newTotalScore" to newTotalScore,
            "pointsAdded" to pointsAdded
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
