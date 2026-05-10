package com.devrats.controller;

import com.devrats.service.AuthService;
import com.devrats.service.GitHubApiClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final GitHubApiClient gitHubApiClient;
    private final String clientId;

    public AuthController(
            AuthService authService, 
            GitHubApiClient gitHubApiClient, 
            @org.springframework.beans.factory.annotation.Value("${github.clientId}") String clientId) {
        this.authService = authService;
        this.gitHubApiClient = gitHubApiClient;
        this.clientId = clientId;
    }

    @GetMapping("/github/login")
    public ResponseEntity<Void> githubLogin(@RequestParam(required = false) String redirectUrl) {
        String appRedirect = redirectUrl != null ? redirectUrl : "http://localhost:8081/callback";
        String state = URLEncoder.encode(appRedirect, StandardCharsets.UTF_8);
        String githubAuthUrl = "https://github.com/login/oauth/authorize" +
                "?client_id=" + clientId +
                "&scope=read:user,user:email" +
                "&state=" + state;
        
        System.out.println("[DEBUG LOGIN] Client ID loaded: '" + clientId + "'");
        System.out.println("[DEBUG LOGIN] Redirecting to: " + githubAuthUrl);
        
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(githubAuthUrl)).build();
    }

    @GetMapping("/github/callback")
    public ResponseEntity<Void> githubCallback(@RequestParam(required = false) String code, @RequestParam(required = false) String state) {
        String baseRedirectUrl = state != null ? state : "http://localhost:8081/callback";

        if (code == null || code.isBlank()) {
            return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(baseRedirectUrl + "?error=missing_code")).build();
        }

        String githubToken = gitHubApiClient.exchangeCodeForToken(code, null);
        if (githubToken == null) {
            return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(baseRedirectUrl + "?error=token_exchange_failed")).build();
        }

        GitHubApiClient.GitHubUser githubUser = gitHubApiClient.getUserInfo(githubToken);
        if (githubUser == null) {
            return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(baseRedirectUrl + "?error=user_fetch_failed")).build();
        }

        AuthService.AuthResponse result = authService.findOrCreateUser(
                githubUser.id(),
                githubUser.login(),
                githubUser.name(),
                githubUser.avatarUrl(),
                githubUser.email()
        );

        String separator = baseRedirectUrl.contains("?") ? "&" : "?";
        String redirectUrl = baseRedirectUrl + separator +
                "accessToken=" + URLEncoder.encode(result.accessToken(), StandardCharsets.UTF_8) +
                "&refreshToken=" + URLEncoder.encode(result.refreshToken(), StandardCharsets.UTF_8);

        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(redirectUrl)).build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthService.TokenRefreshResponse> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null) {
            return ResponseEntity.badRequest().build();
        }
        AuthService.TokenRefreshResponse response = authService.refreshAccessToken(refreshToken);
        if (response == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<AuthService.UserProfile> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userId = (String) authentication.getPrincipal();
        AuthService.UserProfile profile = authService.getProfile(userId);
        if (profile == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(profile);
    }

    @DeleteMapping("/logout")
    public ResponseEntity<Void> logout() {
        // Token revocation would go here if tracked
        return ResponseEntity.noContent().build();
    }
}
