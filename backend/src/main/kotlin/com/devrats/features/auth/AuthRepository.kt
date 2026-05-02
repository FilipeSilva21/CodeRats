package com.devrats.features.auth

import com.devrats.features.auth.models.Users
import com.devrats.features.auth.models.RefreshTokens
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.UUID

class AuthRepository {
    init { transaction { SchemaUtils.createMissingTablesAndColumns(Users, RefreshTokens) } }

    fun findByGithubId(githubId: String) = transaction {
        Users.selectAll().where { Users.githubId eq githubId }.firstOrNull()
    }

    fun createUser(githubId: String, username: String, displayName: String, avatarUrl: String?): String {
        val id = UUID.randomUUID().toString()
        transaction {
            Users.insert {
                it[Users.id] = id; it[Users.githubId] = githubId; it[Users.username] = username
                it[Users.displayName] = displayName; it[Users.avatarUrl] = avatarUrl
            }
        }
        return id
    }

    fun findById(id: String) = transaction { Users.selectAll().where { Users.id eq id }.firstOrNull() }

    fun saveRefreshToken(userId: String, token: String, expiresAt: kotlinx.datetime.Instant) = transaction {
        RefreshTokens.insert {
            it[RefreshTokens.id] = UUID.randomUUID().toString(); it[RefreshTokens.userId] = userId
            it[RefreshTokens.token] = token; it[RefreshTokens.expiresAt] = expiresAt
        }
    }

    fun findRefreshToken(token: String) = transaction {
        RefreshTokens.selectAll().where { RefreshTokens.token eq token }.firstOrNull()
    }

    fun deleteRefreshToken(token: String) = transaction {
        RefreshTokens.deleteWhere { RefreshTokens.token eq token }
    }
}
