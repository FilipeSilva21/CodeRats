package com.devrats.controller;

import com.devrats.service.LeaderboardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {
    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping("/global")
    public ResponseEntity<List<LeaderboardService.LeaderboardEntry>> globalLeaderboard(
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) String league) {
            
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userId = (String) auth.getPrincipal();

        return ResponseEntity.ok(leaderboardService.getGroupLeaderboard(userId));
    }
    
    @GetMapping("/tiers")
    public ResponseEntity<List<Map<String, String>>> getTiers() {
        List<Map<String, String>> tiers = Arrays.asList(
            Map.of("name", "BRONZE", "color", "#CD7F32"),
            Map.of("name", "SILVER", "color", "#C0C0C0"),
            Map.of("name", "GOLD", "color", "#FFD700"),
            Map.of("name", "SAPPHIRE", "color", "#0f52ba"),
            Map.of("name", "RUBY", "color", "#E0115F"),
            Map.of("name", "EMERALD", "color", "#50C878"),
            Map.of("name", "AMETHYST", "color", "#9966CC"),
            Map.of("name", "PEARL", "color", "#EAE0C8"),
            Map.of("name", "OBSIDIAN", "color", "#414a4c"),
            Map.of("name", "DIAMOND", "color", "#b9f2ff")
        );
        return ResponseEntity.ok(tiers);
    }
    
    @PostMapping("/admin/process-leagues")
    public ResponseEntity<?> processLeagues() {
        // In a real app this should be protected by admin auth
        // leagueService.processWeeklyLeagues() 
        return ResponseEntity.ok(Map.of("success", true, "message", "Leagues processed"));
    }
}
