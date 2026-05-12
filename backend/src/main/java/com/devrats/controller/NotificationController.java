package com.devrats.controller;

import com.devrats.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    private String getUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        return (String) auth.getPrincipal();
    }

    // ─────────────────────────────────────────────────────────────
    // Listagem e marcação de notificações
    // ─────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<?> getNotifications() {
        String userId = getUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid token"));
        }

        List<NotificationService.NotificationResponse> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(Map.of("data", notifications));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String id) {
        String userId = getUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid token"));
        }

        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    // ─────────────────────────────────────────────────────────────
    // Preferências de notificação
    // ─────────────────────────────────────────────────────────────

    /**
     * GET /api/notifications/preferences
     * Retorna as preferências de notificação do usuário autenticado.
     */
    @GetMapping("/preferences")
    public ResponseEntity<?> getPreferences() {
        String userId = getUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid token"));
        }

        NotificationService.NotificationPreferences prefs = notificationService.getPreferences(userId);
        return ResponseEntity.ok(Map.of("data", prefs));
    }

    /**
     * PUT /api/notifications/preferences
     * Atualiza as preferências de notificação. Todos os campos são opcionais (patch semântico).
     *
     * Body: { "pushEnabled": true, "emailWeekly": false, "squadAlerts": true }
     */
    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(@RequestBody PreferencesRequest body) {
        String userId = getUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid token"));
        }

        notificationService.updatePreferences(userId, body.pushEnabled(), body.emailWeekly(), body.squadAlerts());
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    public record PreferencesRequest(Boolean pushEnabled, Boolean emailWeekly, Boolean squadAlerts) {}
}
