package com.devrats.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record WebhookPayload(
        String ref,
        List<CommitData> commits,
        SenderData sender,
        RepoData repository,
        InstallationRef installation
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CommitData(
            String id,
            String message,
            String timestamp,
            AuthorData author,
            List<String> added,
            List<String> removed,
            List<String> modified
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AuthorData(String name, String email, String username) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record SenderData(Long id, String login, String avatar_url) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record RepoData(Long id, String name, String full_name, Boolean private_repo) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record InstallationRef(Long id) {}
}
