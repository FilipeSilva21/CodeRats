package com.devrats.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record WebhookPayload(
        @JsonProperty("ref") String ref,
        @JsonProperty("commits") List<CommitData> commits,
        @JsonProperty("sender") SenderData sender,
        @JsonProperty("repository") RepoData repository,
        @JsonProperty("installation") InstallationRef installation
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CommitData(
            @JsonProperty("id") String id,
            @JsonProperty("message") String message,
            @JsonProperty("timestamp") String timestamp,
            @JsonProperty("author") AuthorData author,
            @JsonProperty("added") List<String> added,
            @JsonProperty("removed") List<String> removed,
            @JsonProperty("modified") List<String> modified
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AuthorData(
            @JsonProperty("name") String name, 
            @JsonProperty("email") String email, 
            @JsonProperty("username") String username
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record SenderData(
            @JsonProperty("id") Long id, 
            @JsonProperty("login") String login, 
            @JsonProperty("avatar_url") String avatar_url
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record RepoData(
            @JsonProperty("id") Long id, 
            @JsonProperty("name") String name, 
            @JsonProperty("full_name") String full_name, 
            @JsonProperty("private") Boolean private_repo
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record InstallationRef(
            @JsonProperty("id") Long id
    ) {}
}
