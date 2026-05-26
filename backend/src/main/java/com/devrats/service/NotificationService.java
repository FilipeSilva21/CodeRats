package com.devrats.service;

import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.UUID;

@Service
public class NotificationService {
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    private static final String EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SquadMemberRepository squadMemberRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository, SquadMemberRepository squadMemberRepository, ObjectMapper objectMapper) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.squadMemberRepository = squadMemberRepository;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
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
                .filter(u -> u.getDeletedAt() == null)
                .filter(u -> u.getTotalScore() > oldScore && u.getTotalScore() < newScore && !u.getId().equals(userId))
                .toList();

        // Squads do usuário que fez o commit
        List<SquadMember> userSquadMemberships = squadMemberRepository.findByUserId(userId);

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

                boolean isInSameSquad = squadMemberRepository.findBySquadIdAndUserId(squadId, surpassedUserId).isPresent();

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
        sendPushNotification(notification);
    }

    @Transactional
    public void updateExpoPushToken(String userId, String token) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getDeletedAt() != null) return;
        user.setExpoPushToken(normalizeExpoPushToken(token));
        userRepository.save(user);
    }

    private String normalizeExpoPushToken(String token) {
        if (token == null || token.isBlank()) return null;
        String trimmedToken = token.trim();
        if (!trimmedToken.startsWith("ExponentPushToken[") && !trimmedToken.startsWith("ExpoPushToken[")) {
            logger.warn("Ignoring invalid Expo push token format");
            return null;
        }
        return trimmedToken;
    }

    private void sendPushNotification(Notification notification) {
        User user = userRepository.findById(notification.getUserId()).orElse(null);
        if (user == null || user.getDeletedAt() != null || !user.getNotifPushEnabled()) return;

        String expoPushToken = user.getExpoPushToken();
        if (expoPushToken == null || expoPushToken.isBlank()) return;

        CompletableFuture.runAsync(() -> {
            try {
                Map<String, Object> payload = Map.of(
                        "to", expoPushToken,
                        "title", notification.getTitle(),
                        "body", notification.getMessage(),
                        "data", Map.of(
                                "notificationId", notification.getId(),
                                "type", notification.getType()
                        )
                );

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(EXPO_PUSH_ENDPOINT))
                        .header("Accept", "application/json")
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() >= 300) {
                    logger.warn("Expo push failed for user {} with status {}: {}", user.getId(), response.statusCode(), response.body());
                }
            } catch (Exception e) {
                logger.warn("Failed to send Expo push notification {}", notification.getId(), e);
            }
        });
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

    @Transactional
    public void clearAllNotifications(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notificationRepository.deleteAll(notifications);
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
