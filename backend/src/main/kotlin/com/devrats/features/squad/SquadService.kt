package com.devrats.features.squad

import com.devrats.features.squad.models.Squads
import com.devrats.shared.exceptions.BadRequestException
import com.devrats.shared.exceptions.NotFoundException

class SquadService(private val repo: SquadRepository) {
    fun create(name: String, ownerId: String): Map<String, Any?> {
        val id = repo.create(name, ownerId)
        val squad = repo.findById(id)!!
        return squadToMap(squad)
    }

    fun joinByCode(code: String, userId: String): Map<String, Any?> {
        val squad = repo.findByInviteCode(code) ?: throw NotFoundException("Squad not found")
        val count = repo.memberCount(squad[Squads.id])
        if (count >= squad[Squads.maxMembers]) throw BadRequestException("Squad is full")
        repo.addMember(squad[Squads.id], userId)
        return mapOf("squad" to squadToMap(squad), "members" to emptyList<Any>())
    }

    fun getMySquads(userId: String) = repo.getUserSquads(userId).map { squadToMap(it) }

    fun getDetails(squadId: String): Map<String, Any?> {
        val squad = repo.findById(squadId) ?: throw NotFoundException("Squad not found")
        return mapOf("squad" to squadToMap(squad), "members" to repo.getMembers(squadId).map {
            mapOf("userId" to it[com.devrats.features.squad.models.SquadMembers.userId], "role" to it[com.devrats.features.squad.models.SquadMembers.role])
        })
    }

    private fun squadToMap(row: org.jetbrains.exposed.sql.ResultRow) = mapOf(
        "id" to row[Squads.id], "name" to row[Squads.name], "inviteCode" to row[Squads.inviteCode],
        "ownerId" to row[Squads.ownerId], "maxMembers" to row[Squads.maxMembers],
        "memberCount" to repo.memberCount(row[Squads.id])
    )
}
