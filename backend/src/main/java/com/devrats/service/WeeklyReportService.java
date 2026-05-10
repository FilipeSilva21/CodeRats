package com.devrats.service;

import com.devrats.model.Score;
import com.devrats.model.SquadMember;
import com.devrats.model.User;
import com.devrats.repository.ScoreRepository;
import com.devrats.repository.SquadMemberRepository;
import com.devrats.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WeeklyReportService {
    private static final Logger logger = LoggerFactory.getLogger(WeeklyReportService.class);
    
    private final EmailService emailService;
    private final LeaderboardService leaderboardService;
    private final UserRepository userRepository;
    private final ScoreRepository scoreRepository;
    private final SquadMemberRepository squadMemberRepository;

    public WeeklyReportService(EmailService emailService, LeaderboardService leaderboardService, UserRepository userRepository, ScoreRepository scoreRepository, SquadMemberRepository squadMemberRepository) {
        this.emailService = emailService;
        this.leaderboardService = leaderboardService;
        this.userRepository = userRepository;
        this.scoreRepository = scoreRepository;
        this.squadMemberRepository = squadMemberRepository;
    }

    @Scheduled(cron = "0 0 12 ? * SUN")
    @Transactional(readOnly = true)
    public void sendWeeklyReports() {
        logger.info("Starting Weekly Report Generation (Spring Scheduled)...");

        List<User> users = userRepository.findAll().stream()
                .filter(u -> u.getEmail() != null && !u.getEmail().isBlank())
                .toList();
                
        Instant sevenDaysAgo = LocalDate.now().minusDays(7).atStartOfDay(ZoneOffset.UTC).toInstant();

        for (User user : users) {
            String userId = user.getId();
            String email = user.getEmail();
            String name = user.getDisplayName();

            List<Score> weeklyScores = scoreRepository.findByUserIdAndScoredAtGreaterThanEqual(userId, sevenDaysAgo);
            
            int weeklyCommits = weeklyScores.size();
            int weeklyPoints = weeklyScores.stream().mapToInt(Score::getPoints).sum();
            
            Map<String, Long> repoCounts = weeklyScores.stream()
                    .collect(Collectors.groupingBy(
                            s -> s.getRepositoryName() != null ? s.getRepositoryName() : "Unknown",
                            Collectors.counting()
                    ));
                    
            String topRepo = repoCounts.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("N/A");

            // Calculate group rank
            List<LeaderboardService.LeaderboardEntry> groupLeaderboard = leaderboardService.getGroupLeaderboard(userId);
            String groupRank = groupLeaderboard.stream()
                    .filter(e -> e.userId().equals(userId))
                    .map(e -> String.valueOf(e.rank()))
                    .findFirst()
                    .orElse("Unranked");

            List<SquadMember> squads = squadMemberRepository.findByUserId(userId);
            StringBuilder squadInfoHtml = new StringBuilder();
            
            if (!squads.isEmpty()) {
                squadInfoHtml.append("<h3>Squad Ranks:</h3><ul>");
                for (SquadMember sm : squads) {
                    String squadId = sm.getSquad().getId();
                    String squadName = sm.getSquad().getName();
                    
                    List<User> members = squadMemberRepository.findBySquadId(squadId).stream()
                            .map(SquadMember::getUser)
                            .sorted(Comparator.comparing(User::getTotalScore).reversed())
                            .toList();
                            
                    int squadRank = -1;
                    for (int i = 0; i < members.size(); i++) {
                        if (members.get(i).getId().equals(userId)) {
                            squadRank = i + 1;
                            break;
                        }
                    }
                    
                    squadInfoHtml.append("<li><strong>").append(squadName).append("</strong>: Rank #").append(squadRank).append("</li>");
                }
                squadInfoHtml.append("</ul>");
            }

            String html = String.format("""
                <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Hello %s! \uD83D\uDC00</h2>
                    <p>Here is your weekly DevRats summary:</p>
                    <ul>
                        <li><strong>Weekly Commits:</strong> %d</li>
                        <li><strong>Weekly Points:</strong> %d</li>
                        <li><strong>Top Repository:</strong> %s</li>
                        <li><strong>League Rank (%s):</strong> #%s</li>
                    </ul>
                    %s
                    <p>Keep up the great work and don't break that streak!</p>
                    <p>Cheers,<br/>The DevRats Team</p>
                </body>
                </html>
            """, name, weeklyCommits, weeklyPoints, topRepo, user.getLeague(), groupRank, squadInfoHtml.toString());

            emailService.sendHtmlEmail(email, "Your DevRats Weekly Report", html);
        }
        
        logger.info("Finished Weekly Report Generation.");
    }
}
