package com.devrats.features.notification.models

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.kotlin.datetime.timestamp

object Notifications : Table("notifications") {
    val id = varchar("id", 36)
    val userId = varchar("user_id", 36).index()
    val title = varchar("title", 255)
    val message = text("message")
    val type = varchar("type", 50) // e.g. "GLOBAL_RANKING", "SQUAD_RANKING"
    val isRead = bool("is_read").default(false)
    val createdAt = timestamp("created_at").defaultExpression(org.jetbrains.exposed.sql.kotlin.datetime.CurrentTimestamp)
    
    override val primaryKey = PrimaryKey(id)
}

@Serializable
data class NotificationResponse(
    val id: String,
    val title: String,
    val message: String,
    val type: String,
    val isRead: Boolean,
    val createdAt: String
)
