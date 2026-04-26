package com.devrats.di

import com.devrats.features.auth.AuthRepository
import com.devrats.features.auth.AuthService
import com.devrats.features.github.GitHubApiClient
import com.devrats.features.github.WebhookService
import com.devrats.features.leaderboard.LeaderboardService
import com.devrats.features.scoring.ScoringRepository
import com.devrats.features.scoring.ScoringService
import com.devrats.features.squad.SquadRepository
import com.devrats.features.squad.SquadService
import com.devrats.shared.security.HmacValidator
import com.devrats.shared.security.JwtProvider
import io.ktor.server.application.*
import org.koin.dsl.module

fun appModule(environment: ApplicationEnvironment) = module {
    val githubClientId = environment.config.propertyOrNull("github.clientId")?.getString() ?: ""
    val githubClientSecret = environment.config.propertyOrNull("github.clientSecret")?.getString() ?: ""
    val webhookSecret = environment.config.propertyOrNull("github.webhookSecret")?.getString() ?: "devrats-webhook-secret"

    single { JwtProvider("devrats-jwt-secret", "devrats", "devrats-api", "devrats", 3600000, 604800000) }
    single { HmacValidator(webhookSecret) }
    single { GitHubApiClient(githubClientId, githubClientSecret) }
    single { AuthRepository() }
    single { AuthService(get(), get()) }
    single { com.devrats.shared.websocket.ConnectionManager() }
    single { ScoringRepository() }
    single { ScoringService(get(), get()) }
    single { WebhookService(get()) }
    single { SquadRepository() }
    single { SquadService(get()) }
    single { LeaderboardService() }
}
