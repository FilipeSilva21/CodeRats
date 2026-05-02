package com.devrats.features.squad.models

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.kotlin.datetime.timestamp

object Squads : Table("squads") {
    val id = varchar("id", 36)
    val name = varchar("name", 100)
    val description = varchar("description", 500).nullable()
    val imageUrl = varchar("image_url", 500).nullable()
    val inviteCode = varchar("invite_code", 6).uniqueIndex()
    val ownerId = varchar("owner_id", 36)
    val maxMembers = integer("max_members").default(10)
    val createdAt = timestamp("created_at").defaultExpression(org.jetbrains.exposed.sql.kotlin.datetime.CurrentTimestamp)
    override val primaryKey = PrimaryKey(id)
}

object SquadMembers : Table("squad_members") {
    val squadId = varchar("squad_id", 36).references(Squads.id)
    val userId = varchar("user_id", 36)
    val role = varchar("role", 20).default("member")
    val joinedAt = timestamp("joined_at").defaultExpression(org.jetbrains.exposed.sql.kotlin.datetime.CurrentTimestamp)
    override val primaryKey = PrimaryKey(squadId, userId)
}
