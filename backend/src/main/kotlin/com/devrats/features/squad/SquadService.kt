package com.devrats.features.squad

import com.devrats.features.squad.models.Squads
import com.devrats.features.squad.models.SquadResponse
import com.devrats.features.squad.models.SquadMemberResponse
import com.devrats.features.squad.models.SquadDetailsResponse
import com.devrats.shared.exceptions.BadRequestException
import com.devrats.shared.exceptions.NotFoundException
import com.devrats.shared.exceptions.ForbiddenException

class SquadService(private val repo: SquadRepository) {
    fun create(name: String, ownerId: String): SquadResponse {
        val id = repo.create(name, ownerId)
        val squad = repo.findById(id)!!
        return squadToResponse(squad)
    }

    fun joinByCode(code: String, userId: String): SquadDetailsResponse {
        val squad = repo.findByInviteCode(code) ?: throw NotFoundException("Squad not found")
        val count = repo.memberCount(squad[Squads.id])
        if (count >= squad[Squads.maxMembers]) throw BadRequestException("Squad is full")
        repo.addMember(squad[Squads.id], userId)
        return getDetails(squad[Squads.id])
    }

    fun getMySquads(userId: String): List<SquadResponse> = repo.getUserSquads(userId).map { squadToResponse(it) }

    fun getDetails(squadId: String): SquadDetailsResponse {
        val squad = repo.findById(squadId) ?: throw NotFoundException("Squad not found")
        val members = repo.getMembersDetails(squadId).map {
            SquadMemberResponse(
                userId = it[com.devrats.features.squad.models.SquadMembers.userId],
                role = it[com.devrats.features.squad.models.SquadMembers.role],
                username = it[com.devrats.features.auth.models.Users.username],
                displayName = it[com.devrats.features.auth.models.Users.displayName],
                avatarUrl = it[com.devrats.features.auth.models.Users.avatarUrl],
                totalScore = it[com.devrats.features.auth.models.Users.totalScore]
            )
        }
        return SquadDetailsResponse(squadToResponse(squad), members)
    }

    fun leaveSquad(squadId: String, userId: String) {
        val squad = repo.findById(squadId) ?: throw NotFoundException("Squad not found")
        if (squad[Squads.ownerId] == userId) {
            throw BadRequestException("Owner cannot leave the squad. Transfer ownership or delete squad.")
        }
        repo.removeMember(squadId, userId)
    }

    fun updateSquad(squadId: String, userId: String, name: String?, description: String?, imageUrl: String?): SquadResponse {
        val squad = repo.findById(squadId) ?: throw NotFoundException("Squad not found")
        if (squad[Squads.ownerId] != userId) {
            throw ForbiddenException("Only the owner can update the squad")
        }
        repo.updateSquad(squadId, name, description, imageUrl)
        return squadToResponse(repo.findById(squadId)!!)
    }

    private fun squadToResponse(row: org.jetbrains.exposed.sql.ResultRow) = SquadResponse(
        id = row[Squads.id], 
        name = row[Squads.name], 
        description = row[Squads.description],
        imageUrl = row[Squads.imageUrl],
        inviteCode = row[Squads.inviteCode],
        ownerId = row[Squads.ownerId], 
        maxMembers = row[Squads.maxMembers],
        memberCount = repo.memberCount(row[Squads.id])
    )
}
