package com.devrats.service;

import com.devrats.model.User;
import com.devrats.repository.NotificationRepository;
import com.devrats.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.annotation.Schedules;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

/**
 * Serviço responsável por enviar lembretes periódicos para que o usuário faça um commit.
 *
 * Agenda: 14h, 17h, 20h e 23h (UTC-3 / fuso de Brasília).
 * As notificações são salvas como registro na tabela 'notifications' e o app as busca
 * ao abrir. Cada usuário recebe no máximo 1 reminder por dia (deduplicação via banco).
 * As 6 mensagens rotativas são selecionadas pelo índice do dia do ano (dayOfYear % 6).
 */
@Service
public class CommitReminderService {
    private static final Logger logger = LoggerFactory.getLogger(CommitReminderService.class);

    /** 6 mensagens de lembrete rotativas — selecionadas por (dayOfYear % 6). */
    private static final String[] REMINDER_MESSAGES = {
        "Seu squad está contando os commits de hoje. Vai ficar pra trás? 💪",
        "Não quebre o streak! Um push rápido faz toda a diferença. 🔥",
        "Alguém na sua liga pode te ultrapassar a qualquer momento. Codifica! ⚡",
        "DevRat consistente bate DevRat esporádico sempre. Manda um commit! 🐀",
        "Seu repo tá com saudade de você. Que tal um push hoje? 💻",
        "Um commit por dia mantece o streak sempre ativo. Não para agora! 🏆"
    };

    private static final String REMINDER_TYPE = "COMMIT_REMINDER";
    private static final String REMINDER_TITLE = "🐀 Hora do Commit!";

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    public CommitReminderService(UserRepository userRepository,
                                  NotificationRepository notificationRepository,
                                  NotificationService notificationService) {
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
    }

    /**
     * Roda às 14h, 17h, 20h e 23h no fuso UTC-3 (horário de Brasília).
     * Cron usa UTC, portanto os horários em UTC são: 17h, 20h, 23h e 02h.
     */
    @Schedules({
        @Scheduled(cron = "0 0 17 * * *"),  // 14h BRT
        @Scheduled(cron = "0 0 20 * * *"),  // 17h BRT
        @Scheduled(cron = "0 0 23 * * *"),  // 20h BRT
        @Scheduled(cron = "0 0 2 * * *")    // 23h BRT (02h UTC do dia seguinte)
    })
    @Transactional
    public void sendCommitReminders() {
        logger.info("CommitReminderService: iniciando verificação de reminders...");

        // Início do dia em UTC (equivale ao início do dia BRT para o mesmo dia)
        Instant startOfToday = LocalDate.now(ZoneOffset.ofHours(-3))
                .atStartOfDay(ZoneOffset.UTC)
                .toInstant();

        // Selecionar a mensagem pelo índice do dia (rotação entre as 6)
        int dayOfYear = LocalDate.now(ZoneOffset.ofHours(-3)).getDayOfYear();
        String message = REMINDER_MESSAGES[dayOfYear % REMINDER_MESSAGES.length];

        List<User> eligibleUsers = userRepository.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getNotifPushEnabled()))
                .toList();

        int sent = 0;
        for (User user : eligibleUsers) {
            // Deduplicação: não enviar se já existe um COMMIT_REMINDER de hoje
            boolean alreadySentToday = notificationRepository
                    .existsByUserIdAndTypeAndCreatedAtGreaterThanEqual(user.getId(), REMINDER_TYPE, startOfToday);

            if (!alreadySentToday) {
                notificationService.createNotification(user.getId(), REMINDER_TITLE, message, REMINDER_TYPE);
                sent++;
            }
        }

        logger.info("CommitReminderService: {} reminders enviados (de {} elegíveis).", sent, eligibleUsers.size());
    }
}
