package com.devrats.controller;

import com.devrats.service.LeaderboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;

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
        return ResponseEntity.ok(leaderboardService.getGlobalLeaderboard(limit, league));
    }
    
    @PostMapping("/admin/process-leagues")
    public ResponseEntity<?> processLeagues() {
        // In a real app this should be protected by admin auth
        // leagueService.processWeeklyLeagues() 
        return ResponseEntity.ok(Map.of("success", true, "message", "Leagues processed"));
    }
}
