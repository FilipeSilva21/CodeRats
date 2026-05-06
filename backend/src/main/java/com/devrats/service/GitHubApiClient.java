package com.devrats.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

@Service
public class GitHubApiClient {
    private static final Logger logger = LoggerFactory.getLogger(GitHubApiClient.class);
    private final RestClient restClient;
    private final String clientId;
    private final String clientSecret;

    public GitHubApiClient(
            @Value("${github.clientId}") String clientId,
            @Value("${github.clientSecret}") String clientSecret,
            RestClient.Builder restClientBuilder) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.restClient = restClientBuilder.build();
    }

    public String exchangeCodeForToken(String code, String redirectUri) {
        logger.info("Exchanging OAuth code for token...");
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("client_id", clientId);
        formData.add("client_secret", clientSecret);
        formData.add("code", code);
        if (redirectUri != null) {
            formData.add("redirect_uri", redirectUri);
        }

        try {
            JsonNode response = restClient.post()
                    .uri("https://github.com/login/oauth/access_token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(formData)
                    .retrieve()
                    .body(JsonNode.class);

            if (response != null && response.has("error")) {
                logger.error("GitHub OAuth error: {} - {}", 
                        response.get("error").asText(), 
                        response.has("error_description") ? response.get("error_description").asText() : "unknown");
                return null;
            }

            return response != null && response.has("access_token") ? response.get("access_token").asText() : null;
        } catch (Exception e) {
            logger.error("Failed to parse GitHub token response", e);
            return null;
        }
    }

    private String getUserEmail(String accessToken) {
        try {
            JsonNode emails = restClient.get()
                    .uri("https://api.github.com/user/emails")
                    .header("Authorization", "Bearer " + accessToken)
                    .header("User-Agent", "DevRats-App")
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(JsonNode.class);

            if (emails != null && emails.isArray()) {
                for (JsonNode emailNode : emails) {
                    if (emailNode.has("primary") && emailNode.get("primary").asBoolean()) {
                        return emailNode.get("email").asText();
                    }
                }
                if (!emails.isEmpty()) {
                    return emails.get(0).get("email").asText();
                }
            }
        } catch (Exception e) {
            logger.error("Failed to fetch GitHub emails", e);
        }
        return null;
    }

    public GitHubUser getUserInfo(String accessToken) {
        try {
            JsonNode json = restClient.get()
                    .uri("https://api.github.com/user")
                    .header("Authorization", "Bearer " + accessToken)
                    .header("User-Agent", "DevRats-App")
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(JsonNode.class);

            if (json == null || !json.has("id") || !json.has("login")) {
                return null;
            }

            String email = getUserEmail(accessToken);
            if (email == null && json.has("email") && !json.get("email").isNull()) {
                email = json.get("email").asText();
            }

            String name = json.has("name") && !json.get("name").isNull() ? json.get("name").asText() : json.get("login").asText();
            String avatarUrl = json.has("avatar_url") && !json.get("avatar_url").isNull() ? json.get("avatar_url").asText() : null;

            return new GitHubUser(
                    json.get("id").asText(),
                    json.get("login").asText(),
                    name,
                    avatarUrl,
                    email
            );
        } catch (Exception e) {
            logger.error("Failed to fetch GitHub user info", e);
            return null;
        }
    }

    public record GitHubUser(String id, String login, String name, String avatarUrl, String email) {}
}
