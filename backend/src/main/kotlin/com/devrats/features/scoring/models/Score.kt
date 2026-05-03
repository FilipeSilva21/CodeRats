package com.devrats.features.scoring.models

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.kotlin.datetime.timestamp

object Scores : Table("scores") {
    val id = varchar("id", 36)
    val userId = varchar("user_id", 36)
    val points = integer("points")
    val scoreSource = varchar("source", 50)
    val commitHash = varchar("commit_hash", 100).nullable()
    val scoredAt = timestamp("scored_at").defaultExpression(org.jetbrains.exposed.sql.kotlin.datetime.CurrentTimestamp)
    override val primaryKey = PrimaryKey(id)
}