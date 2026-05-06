package com.devrats.service;

import com.devrats.model.User;
import com.devrats.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaderboardService {
    private final UserRepository userRepository;

    public LeaderboardService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<LeaderboardEntry> getGlobalLeaderboard(int limit, String league) {
        List<User> users = userRepository.findAll();
        
        if (league != null && !league.isBlank()) {
            users = users.stream().filter(u -> league.equals(u.getLeague())).collect(Collectors.toList());
        }

        users.sort(Comparator.comparing(User::getTotalScore).reversed());

        int limitSize = Math.min(users.size(), limit);
        List<LeaderboardEntry> leaderboard = new java.util.ArrayList<>();
        
        for (int i = 0; i < limitSize; i++) {
            User u = users.get(i);
            leaderboard.add(new LeaderboardEntry(
                    i + 1,
                    u.getId(),
                    u.getUsername(),
                    u.getDisplayName(),
                    u.getAvatarUrl(),
                    u.getTotalScore(),
                    u.getEffectiveStreak(),
                    u.getLeague()
            ));
        }
        
        return leaderboard;
    }

    public record LeaderboardEntry(int rank, String userId, String username, String displayName, String avatarUrl, int totalScore, int currentStreak, String league) {}
}
