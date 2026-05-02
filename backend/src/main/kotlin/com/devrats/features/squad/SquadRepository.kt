package com.devrats.features.squad

import com.devrats.features.squad.models.Squads
import com.devrats.features.squad.models.SquadMembers
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID

class SquadRepository {
    init { transaction { SchemaUtils.createMissingTablesAndColumns(Squads, SquadMembers) } }

    fun create(name: String, ownerId: String): String {
        val id = UUID.randomUUID().toString()
        val code = (1..6).map { "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".random() }.joinToString("")
        transaction {
            Squads.insert { it[Squads.id] = id; it[Squads.name] = name; it[inviteCode] = code; it[Squads.ownerId] = ownerId }
            SquadMembers.insert { it[squadId] = id; it[userId] = ownerId; it[role] = "owner" }
        }
        return id
    }

    fun findByInviteCode(code: String) = transaction {
        Squads.selectAll().where { Squads.inviteCode eq code }.firstOrNull()
    }

    fun findById(id: String) = transaction {
        Squads.selectAll().where { Squads.id eq id }.firstOrNull()
    }

    fun updateSquad(squadId: String, name: String?, description: String?, imageUrl: String?) = transaction {
        Squads.update({ Squads.id eq squadId }) { stmt ->
            name?.let { stmt[Squads.name] = it }
            description?.let { stmt[Squads.description] = it }
            imageUrl?.let { stmt[Squads.imageUrl] = it }
        }
    }

    fun removeMember(squadId: String, userId: String) = transaction {
        SquadMembers.deleteWhere { (SquadMembers.squadId eq squadId) and (SquadMembers.userId eq userId) }
    }

    fun addMember(squadId: String, userId: String) = transaction {
        SquadMembers.insert { it[SquadMembers.squadId] = squadId; it[SquadMembers.userId] = userId }
    }

    fun getMembersDetails(squadId: String) = transaction {
        SquadMembers.innerJoin(
            com.devrats.features.auth.models.Users,
            onColumn = { SquadMembers.userId },
            otherColumn = { com.devrats.features.auth.models.Users.id }
        ).selectAll().where { SquadMembers.squadId eq squadId }
         .toList()
    }

    fun getUserSquads(userId: String) = transaction {
        (SquadMembers innerJoin Squads).selectAll().where { SquadMembers.userId eq userId }.toList()
    }

    fun memberCount(squadId: String) = transaction {
        SquadMembers.selectAll().where { SquadMembers.squadId eq squadId }.count().toInt()
    }
}
