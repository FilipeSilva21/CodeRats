package com.devrats.features.github

import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.request.forms.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.slf4j.LoggerFactory

class GitHubApiClient(private val clientId: String, private val clientSecret: String) {
    private val logger = LoggerFactory.getLogger(GitHubApiClient::class.java)

    private val client = HttpClient(CIO)

    /**
     * Exchange the OAuth code for a GitHub access token.
     * Uses form-urlencoded POST (GitHub's preferred format).
     */
    suspend fun exchangeCodeForToken(code: String): String? {
        logger.info("Exchanging OAuth code for token (clientId=$clientId, code=${code.take(6)}...)")

        val response = client.submitForm(
            url = "https://github.com/login/oauth/access_token",
            formParameters = Parameters.build {
                append("client_id", clientId)
                append("client_secret", clientSecret)
                append("code", code)
            }
        ) {
            accept(ContentType.Application.Json)
        }

        val body = response.bodyAsText()
        val status = response.status
        logger.info("GitHub token exchange response (status=$status): $body")

        return try {
            val json = Json.parseToJsonElement(body).jsonObject

            // Check for error in response
            val error = json["error"]?.jsonPrimitive?.content
            if (error != null) {
                val desc = json["error_description"]?.jsonPrimitive?.content ?: "unknown"
                logger.error("GitHub OAuth error: $error - $desc")
                return null
            }

            json["access_token"]?.jsonPrimitive?.content
        } catch (e: Exception) {
            logger.error("Failed to parse GitHub token response: $body", e)
            null
        }
    }

    /**
     * Fetch the authenticated user's profile from GitHub.
     */
    suspend fun getUserInfo(accessToken: String): GitHubUser? {
        logger.info("Fetching GitHub user info...")

        val response = client.get("https://api.github.com/user") {
            header("Authorization", "Bearer $accessToken")
            header("User-Agent", "DevRats-App")
            accept(ContentType.Application.Json)
        }

        val body = response.bodyAsText()
        logger.info("GitHub user info response (status=${response.status}): ${body.take(200)}")

        return try {
            val json = Json.parseToJsonElement(body).jsonObject
            GitHubUser(
                id = json["id"]?.jsonPrimitive?.content ?: return null,
                login = json["login"]?.jsonPrimitive?.content ?: return null,
                name = json["name"]?.jsonPrimitive?.content ?: json["login"]?.jsonPrimitive?.content ?: "",
                avatarUrl = json["avatar_url"]?.jsonPrimitive?.content
            )
        } catch (e: Exception) {
            logger.error("Failed to parse GitHub user info: $body", e)
            null
        }
    }
}

data class GitHubUser(val id: String, val login: String, val name: String, val avatarUrl: String?)
