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

    // ─────────────────────────────────────────────────────────────
    // Surpass Notifications (Squad + Liga)
    // ─────────────────────────────────────────────────────────────

    @Transactional
    public void checkAndSendSurpassNotifications(String userId, int oldScore, int newScore) {
        if (oldScore >= newScore) return;

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;
        String username = user.getUsername();

        // Quais usuários o usuário atual ultrapassou?
        List<User> globallySurpassed = userRepository.findAll().stream()
                .filter(u -> u.getTotalScore() > oldScore && u.getTotalScore() <= newScore && !u.getId().equals(userId))
                .toList();

        // Squads do usuário que fez o commit
        List<SquadMember> userSquadMemberships = squadMemberRepository.findAll().stream()
                .filter(sm -> sm.getUser().getId().equals(userId))
                .toList();

        for (User surpassedUser : globallySurpassed) {
            // Respeitar preferência: o usuário surpassado precisa ter squad alerts ativos
            if (!surpassedUser.getNotifSquadAlerts()) {
                logger.debug("Squad alerts disabled for {}, skipping surpass notification", surpassedUser.getId());
                continue;
            }

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
                            "🏆 Squad Alert",
                            username + " te ultrapassou no squad \"" + squadName + "\"! Hora de reagir!",
                            "SQUAD_RANKING"
                    );
                    logger.info("Sent SQUAD_RANKING notification to {}", surpassedUserId);
                    notifiedForSquad = true;
                    break;
                }
            }

            if (!notifiedForSquad) {
                // Mesma liga? Verificar se estão no mesmo activeLeagueGroupId
                boolean sameLeagueGroup = user.getActiveLeagueGroupId() != null
                        && user.getActiveLeagueGroupId().equals(surpassedUser.getActiveLeagueGroupId());

                if (sameLeagueGroup) {
                    createNotification(
                            surpassedUserId,
                            "⚡ Liga Alert",
                            username + " te ultrapassou na sua liga " + surpassedUser.getLeague() + "!",
                            "LEAGUE_RANKING"
                    );
                    logger.info("Sent LEAGUE_RANKING notification to {}", surpassedUserId);
                } else {
                    createNotification(
                            surpassedUserId,
                            "📊 Global Ranking Alert",
                            username + " acabou de te ultrapassar no ranking global!",
                            "GLOBAL_RANKING"
                    );
                    logger.info("Sent GLOBAL_RANKING notification to {}", surpassedUserId);
                }
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // CRUD de Notificações
    // ─────────────────────────────────────────────────────────────

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

    // ─────────────────────────────────────────────────────────────
    // Preferências de Notificação
    // ─────────────────────────────────────────────────────────────

    public NotificationPreferences getPreferences(String userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return new NotificationPreferences(true, false, true);
        return new NotificationPreferences(
                user.getNotifPushEnabled(),
                user.getNotifEmailWeekly(),
                user.getNotifSquadAlerts()
        );
    }

    @Transactional
    public void updatePreferences(String userId, Boolean pushEnabled, Boolean emailWeekly, Boolean squadAlerts) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;
        if (pushEnabled != null) user.setNotifPushEnabled(pushEnabled);
        if (emailWeekly != null) user.setNotifEmailWeekly(emailWeekly);
        if (squadAlerts != null) user.setNotifSquadAlerts(squadAlerts);
        userRepository.save(user);
        logger.info("Updated notification preferences for user {}: push={}, emailWeekly={}, squadAlerts={}",
                userId, pushEnabled, emailWeekly, squadAlerts);
    }

    // ─────────────────────────────────────────────────────────────
    // DTOs
    // ─────────────────────────────────────────────────────────────

    public record NotificationResponse(String id, String title, String message, String type, boolean isRead, String createdAt) {}
    public record NotificationPreferences(boolean pushEnabled, boolean emailWeekly, boolean squadAlerts) {}
}
