package com.devrats.repository;

import com.devrats.model.SquadMember;
import com.devrats.model.SquadMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SquadMemberRepository extends JpaRepository<SquadMember, SquadMemberId> {
    List<SquadMember> findBySquadId(String squadId);
    List<SquadMember> findByUserId(String userId);
    int countBySquadId(String squadId);
    Optional<SquadMember> findBySquadIdAndUserId(String squadId, String userId);

    @Modifying
    @Query("DELETE FROM SquadMember sm WHERE sm.squad.id = :squadId")
    void deleteBySquadId(String squadId);
}
