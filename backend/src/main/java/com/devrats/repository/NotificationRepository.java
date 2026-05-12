package com.devrats.repository;

import com.devrats.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Notification> findByUserIdAndIsReadFalse(String userId);

    /** Verifica se já existe uma notificação do tipo informado para o usuário a partir de um instante. */
    boolean existsByUserIdAndTypeAndCreatedAtGreaterThanEqual(String userId, String type, Instant since);
}
