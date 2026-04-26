package com.devrats.features.leaderboard

import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import kotlinx.coroutines.channels.ClosedReceiveChannelException

import org.koin.ktor.ext.inject
import com.devrats.shared.websocket.ConnectionManager

fun Application.leaderboardWebSocket() {
    val connectionManager by inject<ConnectionManager>()
    
    routing {
        webSocket("/leaderboard/global") {
            connectionManager.addConnection(this)
            try {
                for (frame in incoming) { /* keep alive */ }
            } catch (e: Exception) {
                // client disconnected
            } finally {
                connectionManager.removeConnection(this)
            }
        }
    }
}
