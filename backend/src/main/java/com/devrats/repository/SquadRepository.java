package com.devrats.repository;

import com.devrats.model.Squad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SquadRepository extends JpaRepository<Squad, String> {
    Squad findByInviteCode(String inviteCode);
    List<Squad> findByOwnerId(String ownerId);
}
