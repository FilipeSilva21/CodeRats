package com.devrats.features.scoring.services

import com.devrats.features.auth.models.Users
import com.devrats.features.scoring.models.League
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

class LeagueService {
    
    // Promotes top 20%, demotes bottom 20% in each league
    fun processWeeklyLeagues() = transaction {
        val leagues = League.values()
        
        for (league in leagues) {
            val usersInLeague = Users.selectAll()
                .where { Users.league eq league.name }
                .orderBy(Users.totalScore, SortOrder.DESC)
                .toList()
                
            if (usersInLeague.isEmpty()) continue
            
            val totalUsers = usersInLeague.size
            // If less than 5 people, promote top 1, demote bottom 1
            val promotionCount = (totalUsers * 0.2).toInt().coerceAtLeast(1)
            val demotionCount = (totalUsers * 0.2).toInt().coerceAtLeast(1)
            
            // Promotion
            if (league != League.DIAMOND) {
                val nextLeague = leagues[league.ordinal + 1]
                val usersToPromote = usersInLeague.take(promotionCount).map { it[Users.id] }
                
                if (usersToPromote.isNotEmpty()) {
                    Users.update({ Users.id inList usersToPromote }) {
                        it[Users.league] = nextLeague.name
                    }
                }
            }
            
            // Demotion
            if (league != League.BRONZE) {
                val prevLeague = leagues[league.ordinal - 1]
                val usersToDemote = usersInLeague.takeLast(demotionCount).map { it[Users.id] }
                
                if (usersToDemote.isNotEmpty()) {
                    Users.update({ Users.id inList usersToDemote }) {
                        it[Users.league] = prevLeague.name
                    }
                }
            }
        }
    }
}
