package com.devrats.features.auth

import com.devrats.features.github.GitHubApiClient
import com.devrats.shared.extensions.userId
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.http.*
import org.koin.ktor.ext.inject
import java.net.URLEncoder

fun Application.authRoutes() {
    val service by inject<AuthService>()
    val githubClient by inject<GitHubApiClient>()

    val clientId = environment.config.propertyOrNull("github.clientId")?.getString() ?: ""
    val frontendUrl = "http://localhost:8081"

    routing {
        route("/api/auth") {

            // Step 1: Redirect user to GitHub for authorization
            get("/github/login") {
                val appRedirect = call.request.queryParameters["redirectUrl"] ?: "$frontendUrl/auth/callback"
                val state = URLEncoder.encode(appRedirect, "UTF-8")
                val githubAuthUrl = "https://github.com/login/oauth/authorize" +
                    "?client_id=$clientId" +
                    "&scope=read:user" +
                    "&state=$state" +
                    "&redirect_uri=" + URLEncoder.encode("http://localhost:8080/api/auth/github/callback", "UTF-8")
                call.respondRedirect(githubAuthUrl)
            }

            // Step 2: GitHub redirects here with ?code=XXX
            get("/github/callback") {
                val code = call.parameters["code"]
                val state = call.parameters["state"]
                val baseRedirectUrl = state ?: "$frontendUrl/auth/callback"
                
                if (code.isNullOrBlank()) {
                    call.respondRedirect("$baseRedirectUrl?error=missing_code")
                    return@get
                }

                // Exchange code for GitHub access token
                val githubToken = githubClient.exchangeCodeForToken(code, "http://localhost:8080/api/auth/github/callback")
                if (githubToken == null) {
                    call.respondRedirect("$baseRedirectUrl?error=token_exchange_failed")
                    return@get
                }

                // Fetch user info from GitHub
                val githubUser = githubClient.getUserInfo(githubToken)
                if (githubUser == null) {
                    call.respondRedirect("$baseRedirectUrl?error=user_fetch_failed")
                    return@get
                }

                // Create or find user in our DB and generate JWT
                val result = service.findOrCreateUser(
                    githubId = githubUser.id,
                    username = githubUser.login,
                    displayName = githubUser.name,
                    avatarUrl = githubUser.avatarUrl
                )

                val accessToken = result.accessToken
                val refreshToken = result.refreshToken

                val separator = if (baseRedirectUrl.contains("?")) "&" else "?"

                // Redirect back to frontend with tokens
                call.respondRedirect(
                    "$baseRedirectUrl$separator" +
                    "accessToken=${URLEncoder.encode(accessToken, "UTF-8")}" +
                    "&refreshToken=${URLEncoder.encode(refreshToken, "UTF-8")}"
                )
            }

            // JSON API endpoint for token refresh
            post("/refresh") {
                val body = call.receive<Map<String, String>>()
                val result = service.refreshAccessToken(body["refreshToken"] ?: "")
                call.respond(result)
            }

            // Protected routes
            authenticate("auth-jwt") {
                get("/me") {
                    val profile = service.getProfile(call.userId())
                    call.respond(profile)
                }
                delete("/logout") {
                    call.respond(HttpStatusCode.NoContent)
                }
            }
        }
    }
}
