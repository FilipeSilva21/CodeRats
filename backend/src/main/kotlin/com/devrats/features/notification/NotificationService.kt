package com.devrats.features.notification

import com.devrats.features.auth.models.Users
import com.devrats.features.squad.models.SquadMembers
import com.devrats.features.squad.models.Squads
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.slf4j.LoggerFactory

class NotificationService(private val repo: NotificationRepository) {
    private val logger = LoggerFactory.getLogger(NotificationService::class.java)

    fun checkAndSendSurpassNotifications(userId: String, oldScore: Int, newScore: Int) {
        if (oldScore >= newScore) return

        transaction {
            val userRow = Users.selectAll().where { Users.id eq userId }.singleOrNull() ?: return@transaction
            val username = userRow[Users.username]

            // 1. Global Surpassed
            val globallySurpassed = Users.selectAll()
                .where { (Users.totalScore greater oldScore) and (Users.totalScore lessEq newScore) and (Users.id neq userId) }
                .toList()

            // 2. Squads the user belongs to
            val userSquads = SquadMembers.innerJoin(Squads).selectAll()
                .where { SquadMembers.userId eq userId }
                .map { it[Squads.id] to it[Squads.name] }

            for (surpassedUser in globallySurpassed) {
                val surpassedUserId = surpassedUser[Users.id]
                var notifiedForSquad = false

                // Check if they are in the same squad
                for ((squadId, squadName) in userSquads) {
                    val isInSameSquad = SquadMembers.selectAll()
                        .where { (SquadMembers.squadId eq squadId) and (SquadMembers.userId eq surpassedUserId) }
                        .count() > 0

                    if (isInSameSquad) {
                        repo.createNotification(
                            userId = surpassedUserId,
                            title = "Squad Alert",
                            message = "$username surpassed you in $squadName!",
                            type = "SQUAD_RANKING"
                        )
                        logger.info("Sent SQUAD_RANKING notification to $surpassedUserId")
                        notifiedForSquad = true
                        break // only notify for the first common squad to avoid spam
                    }
                }

                // If not notified for squad, notify globally
                if (!notifiedForSquad) {
                    repo.createNotification(
                        userId = surpassedUserId,
                        title = "Global Ranking Alert",
                        message = "$username just surpassed you in the global ranking!",
                        type = "GLOBAL_RANKING"
                    )
                    logger.info("Sent GLOBAL_RANKING notification to $surpassedUserId")
                }
            }
        }
    }

    fun getUserNotifications(userId: String) = repo.getUserNotifications(userId)

    fun markAsRead(notificationId: String, userId: String) = repo.markAsRead(notificationId, userId)
}
