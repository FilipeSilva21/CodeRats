package com.devrats.service;

import com.devrats.model.LeagueGroup;
import com.devrats.model.Score;
import com.devrats.model.User;
import com.devrats.repository.LeagueGroupRepository;
import com.devrats.repository.ScoreRepository;
import com.devrats.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class LeagueService {
    private static final Logger logger = LoggerFactory.getLogger(LeagueService.class);
    
    private final LeagueGroupRepository leagueGroupRepository;
    private final UserRepository userRepository;
    private final ScoreRepository scoreRepository;
    
    private static final List<String> TIERS = Arrays.asList(
            "BRONZE", "SILVER", "GOLD", "SAPPHIRE", "RUBY", 
            "EMERALD", "AMETHYST", "PEARL", "OBSIDIAN", "DIAMOND"
    );

    public LeagueService(LeagueGroupRepository leagueGroupRepository, UserRepository userRepository, ScoreRepository scoreRepository) {
        this.leagueGroupRepository = leagueGroupRepository;
        this.userRepository = userRepository;
        this.scoreRepository = scoreRepository;
    }

    @Transactional
    public void assignUserToGroup(User user) {
        if (user.getActiveLeagueGroupId() != null) {
            return;
        }

        List<LeagueGroup> availableGroups = leagueGroupRepository.findByTierAndActiveTrueAndMemberCountLessThan(user.getLeague(), 30);
        
        LeagueGroup group;
        if (availableGroups.isEmpty()) {
            group = new LeagueGroup();
            group.setId(UUID.randomUUID().toString());
            group.setTier(user.getLeague());
            group = leagueGroupRepository.save(group);
            logger.info("Created new {} league group: {}", group.getTier(), group.getId());
        } else {
            group = availableGroups.get(0);
        }

        user.setActiveLeagueGroupId(group.getId());
        userRepository.save(user);
        
        group.setMemberCount(group.getMemberCount() + 1);
        leagueGroupRepository.save(group);
        
        logger.info("Assigned user {} to group {}", user.getUsername(), group.getId());
    }

    @Scheduled(cron = "0 0 0 * * MON") // Midnight between Sunday and Monday
    @Transactional
    public void processWeeklyLeagues() {
        logger.info("Starting weekly league processing...");
        List<LeagueGroup> activeGroups = leagueGroupRepository.findByActiveTrue();
        
        for (LeagueGroup group : activeGroups) {
            List<User> members = userRepository.findAll().stream()
                    .filter(u -> group.getId().equals(u.getActiveLeagueGroupId()))
                    .toList();
                    
            if (members.isEmpty()) {
                group.setActive(false);
                leagueGroupRepository.save(group);
                continue;
            }
            
            // Calculate weekly scores for each member
            Map<User, Integer> weeklyScores = new HashMap<>();
            for (User member : members) {
                int score = scoreRepository.findByUserIdAndScoredAtGreaterThanEqual(member.getId(), group.getCreatedAt())
                        .stream().mapToInt(Score::getPoints).sum();
                weeklyScores.put(member, score);
            }
            
            // Sort descending by score
            List<User> sortedMembers = new ArrayList<>(members);
            sortedMembers.sort((u1, u2) -> weeklyScores.get(u2).compareTo(weeklyScores.get(u1)));
            
            int total = sortedMembers.size();
            
            for (int i = 0; i < total; i++) {
                User u = sortedMembers.get(i);
                String currentTier = u.getLeague();
                int tierIndex = TIERS.indexOf(currentTier);
                
                if (i < 5) {
                    // Promote
                    if (tierIndex < TIERS.size() - 1) {
                        u.setLeague(TIERS.get(tierIndex + 1));
                        logger.info("Promoted user {} to {}", u.getUsername(), u.getLeague());
                    }
                } else if (i >= total - 5) {
                    // Demote
                    if (tierIndex > 0) {
                        u.setLeague(TIERS.get(tierIndex - 1));
                        logger.info("Demoted user {} to {}", u.getUsername(), u.getLeague());
                    }
                }
                
                u.setActiveLeagueGroupId(null);
                userRepository.save(u);
            }
            
            group.setActive(false);
            leagueGroupRepository.save(group);
        }
        logger.info("Finished weekly league processing.");
    }
}
