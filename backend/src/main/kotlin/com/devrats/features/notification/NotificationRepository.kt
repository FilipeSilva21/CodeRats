package com.devrats.features.notification

import com.devrats.features.notification.models.Notifications
import com.devrats.features.notification.models.NotificationResponse
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID
import kotlinx.datetime.Clock

class NotificationRepository {
    init { transaction { SchemaUtils.createMissingTablesAndColumns(Notifications) } }

    fun createNotification(userId: String, title: String, message: String, type: String) = transaction {
        Notifications.insert {
            it[Notifications.id] = UUID.randomUUID().toString()
            it[Notifications.userId] = userId
            it[Notifications.title] = title
            it[Notifications.message] = message
            it[Notifications.type] = type
            it[Notifications.createdAt] = Clock.System.now()
        }
    }

    fun getUserNotifications(userId: String): List<NotificationResponse> = transaction {
        Notifications.selectAll().where { Notifications.userId eq userId }
            .orderBy(Notifications.createdAt, SortOrder.DESC)
            .map {
                NotificationResponse(
                    id = it[Notifications.id],
                    title = it[Notifications.title],
                    message = it[Notifications.message],
                    type = it[Notifications.type],
                    isRead = it[Notifications.isRead],
                    createdAt = it[Notifications.createdAt].toString()
                )
            }
    }

    fun markAsRead(notificationId: String, userId: String) = transaction {
        Notifications.update({ (Notifications.id eq notificationId) and (Notifications.userId eq userId) }) {
            it[Notifications.isRead] = true
        }
    }
}
