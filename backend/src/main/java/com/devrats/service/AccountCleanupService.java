package com.devrats.service;

import com.devrats.model.Squad;
import com.devrats.model.User;
import com.devrats.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class AccountCleanupService {
    private static final Logger logger = LoggerFactory.getLogger(AccountCleanupService.class);

    private final UserRepository userRepository;
    private final ScoreRepository scoreRepository;
    private final NotificationRepository notificationRepository;
    private final SquadMemberRepository squadMemberRepository;
    private final SquadRepository squadRepository;

    public AccountCleanupService(UserRepository userRepository, ScoreRepository scoreRepository, NotificationRepository notificationRepository, SquadMemberRepository squadMemberRepository, SquadRepository squadRepository) {
        this.userRepository = userRepository;
        this.scoreRepository = scoreRepository;
        this.notificationRepository = notificationRepository;
        this.squadMemberRepository = squadMemberRepository;
        this.squadRepository = squadRepository;
    }

    @Scheduled(cron = "0 0 3 * * ?") // Runs daily at 3:00 AM
    @Transactional
    public void permanentlyDeleteExpiredAccounts() {
        logger.info("Running scheduled cleanup for soft-deleted accounts...");

        Instant cutoffDate = Instant.now().minus(60, ChronoUnit.DAYS);
        
        List<User> expiredUsers = userRepository.findAll().stream()
                .filter(u -> u.getDeletedAt() != null && u.getDeletedAt().isBefore(cutoffDate))
                .toList();

        for (User user : expiredUsers) {
            String userId = user.getId();
            logger.info("Permanently deleting user: {} (soft-deleted on: {})", user.getUsername(), user.getDeletedAt());

            notificationRepository.deleteByUserId(userId);
            scoreRepository.deleteByUserId(userId);
            
            squadMemberRepository.deleteByUserId(userId);
            
            List<Squad> ownedSquads = squadRepository.findByOwnerId(userId);
            for (Squad squad : ownedSquads) {
                squadMemberRepository.deleteBySquadId(squad.getId());
                squadRepository.delete(squad);
            }

            userRepository.delete(user);
        }

        logger.info("Finished account cleanup. Permanently deleted {} accounts.", expiredUsers.size());
    }
}
