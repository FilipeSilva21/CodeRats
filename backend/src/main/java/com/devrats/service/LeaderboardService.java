package com.devrats.service;

import com.devrats.model.LeagueGroup;
import com.devrats.model.Score;
import com.devrats.model.User;
import com.devrats.repository.LeagueGroupRepository;
import com.devrats.repository.ScoreRepository;
import com.devrats.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class LeaderboardService {
    private final UserRepository userRepository;
    private final LeagueGroupRepository leagueGroupRepository;
    private final ScoreRepository scoreRepository;
    private final LeagueService leagueService;

    public LeaderboardService(UserRepository userRepository, LeagueGroupRepository leagueGroupRepository, ScoreRepository scoreRepository, LeagueService leagueService) {
        this.userRepository = userRepository;
        this.leagueGroupRepository = leagueGroupRepository;
        this.scoreRepository = scoreRepository;
        this.leagueService = leagueService;
    }

    public List<LeaderboardEntry> getGroupLeaderboard(String userId) {
        User currentUser = userRepository.findById(userId).orElseThrow();
        
        if (currentUser.getActiveLeagueGroupId() == null) {
            leagueService.assignUserToGroup(currentUser);
            currentUser = userRepository.findById(userId).orElseThrow();
        }

        String groupId = currentUser.getActiveLeagueGroupId();
        LeagueGroup group = leagueGroupRepository.findById(groupId).orElse(null);
        
        List<User> groupMembers = userRepository.findAll().stream()
                .filter(u -> groupId.equals(u.getActiveLeagueGroupId()) && u.getDeletedAt() == null)
                .toList();

        List<LeaderboardEntry> leaderboard = new ArrayList<>();
        
        for (User u : groupMembers) {
            int weeklyXp = 0;
            if (group != null) {
                weeklyXp = scoreRepository.findByUserIdAndScoredAtGreaterThanEqual(u.getId(), group.getCreatedAt())
                        .stream().mapToInt(Score::getPoints).sum();
            }
            
            leaderboard.add(new LeaderboardEntry(
                    0, // Will be set during sorting
                    u.getId(),
                    u.getUsername(),
                    u.getDisplayName(),
                    u.getAvatarUrl(),
                    weeklyXp, // Replaced totalScore with weeklyXp for the ranking
                    u.getEffectiveStreak(),
                    u.getLeague()
            ));
        }

        leaderboard.sort(Comparator.comparing(LeaderboardEntry::totalScore).reversed());

        for (int i = 0; i < leaderboard.size(); i++) {
            LeaderboardEntry old = leaderboard.get(i);
            leaderboard.set(i, new LeaderboardEntry(
                    i + 1, old.userId(), old.username(), old.displayName(), 
                    old.avatarUrl(), old.totalScore(), old.currentStreak(), old.league()
            ));
        }
        
        return leaderboard;
    }

    public record LeaderboardEntry(int rank, String userId, String username, String displayName, String avatarUrl, int totalScore, int currentStreak, String league) {}
}
