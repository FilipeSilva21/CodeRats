package com.devrats.repository;

import com.devrats.model.LeagueGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeagueGroupRepository extends JpaRepository<LeagueGroup, String> {
    List<LeagueGroup> findByTierAndActiveTrueAndMemberCountLessThan(String tier, int maxMembers);
    List<LeagueGroup> findByActiveTrue();
}
