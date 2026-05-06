package com.devrats.service;

import com.devrats.model.Notification;
import com.devrats.model.SquadMember;
import com.devrats.model.User;
import com.devrats.repository.NotificationRepository;
import com.devrats.repository.SquadMemberRepository;
import com.devrats.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SquadMemberRepository squadMemberRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository, SquadMemberRepository squadMemberRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.squadMemberRepository = squadMemberRepository;
    }

    @Transactional
    public void checkAndSendSurpassNotifications(String userId, int oldScore, int newScore) {
        if (oldScore >= newScore) return;

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;
        String username = user.getUsername();

        // 1. Global Surpassed
        List<User> globallySurpassed = userRepository.findAll().stream()
                .filter(u -> u.getTotalScore() > oldScore && u.getTotalScore() <= newScore && !u.getId().equals(userId))
                .toList();

        // 2. Squads the user belongs to
        List<SquadMember> userSquadMemberships = squadMemberRepository.findAll().stream()
                .filter(sm -> sm.getUser().getId().equals(userId))
                .toList();

        for (User surpassedUser : globallySurpassed) {
            String surpassedUserId = surpassedUser.getId();
            boolean notifiedForSquad = false;

            for (SquadMember userSquadMembership : userSquadMemberships) {
                String squadId = userSquadMembership.getSquad().getId();
                String squadName = userSquadMembership.getSquad().getName();

                boolean isInSameSquad = squadMemberRepository.findAll().stream()
                        .anyMatch(sm -> sm.getSquad().getId().equals(squadId) && sm.getUser().getId().equals(surpassedUserId));

                if (isInSameSquad) {
                    createNotification(
                            surpassedUserId,
                            "Squad Alert",
                            username + " surpassed you in " + squadName + "!",
                            "SQUAD_RANKING"
                    );
                    logger.info("Sent SQUAD_RANKING notification to {}", surpassedUserId);
                    notifiedForSquad = true;
                    break;
                }
            }

            if (!notifiedForSquad) {
                createNotification(
                        surpassedUserId,
                        "Global Ranking Alert",
                        username + " just surpassed you in the global ranking!",
                        "GLOBAL_RANKING"
                );
                logger.info("Sent GLOBAL_RANKING notification to {}", surpassedUserId);
            }
        }
    }

    @Transactional
    public void createNotification(String userId, String title, String message, String type) {
        Notification notification = new Notification();
        notification.setId(UUID.randomUUID().toString());
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(false);
        notification.setCreatedAt(Instant.now());
        notificationRepository.save(notification);
    }

    public List<NotificationResponse> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(n -> new NotificationResponse(
                        n.getId(),
                        n.getTitle(),
                        n.getMessage(),
                        n.getType(),
                        n.getIsRead(),
                        n.getCreatedAt().toString()
                ))
                .toList();
    }

    @Transactional
    public void markAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null && notification.getUserId().equals(userId)) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }

    public record NotificationResponse(String id, String title, String message, String type, boolean isRead, String createdAt) {}
}

