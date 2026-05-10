package com.devrats.service;

import com.devrats.model.Squad;
import com.devrats.model.SquadMember;
import com.devrats.model.SquadMemberId;
import com.devrats.model.User;
import com.devrats.repository.SquadMemberRepository;
import com.devrats.repository.SquadRepository;
import com.devrats.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SquadService {
    private final SquadRepository squadRepository;
    private final SquadMemberRepository squadMemberRepository;
    private final UserRepository userRepository;

    public SquadService(SquadRepository squadRepository, SquadMemberRepository squadMemberRepository, UserRepository userRepository) {
        this.squadRepository = squadRepository;
        this.squadMemberRepository = squadMemberRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public SquadResponse create(String name, String ownerId) {
        String inviteCode = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        
        Squad squad = new Squad();
        squad.setId(UUID.randomUUID().toString());
        squad.setName(name);
        squad.setOwnerId(ownerId);
        squad.setInviteCode(inviteCode);
        squad.setMaxMembers(10);
        squad = squadRepository.save(squad);

        addMemberToSquad(squad, ownerId, "OWNER");

        return squadToResponse(squad);
    }

    @Transactional
    public SquadDetailsResponse joinByCode(String code, String userId) {
        Squad squad = squadRepository.findByInviteCode(code);
        if (squad == null) throw new RuntimeException("Squad not found");
        
        long count = squadMemberRepository.countBySquadId(squad.getId());
        if (count >= squad.getMaxMembers()) throw new RuntimeException("Squad is full");
        
        addMemberToSquad(squad, userId, "MEMBER");
        return getDetails(squad.getId());
    }

    public List<SquadResponse> getMySquads(String userId) {
        return squadMemberRepository.findByUserId(userId).stream()
                .map(sm -> squadToResponse(sm.getSquad()))
                .collect(Collectors.toList());
    }

    public SquadDetailsResponse getDetails(String squadId) {
        Squad squad = squadRepository.findById(squadId).orElseThrow(() -> new RuntimeException("Squad not found"));
        List<SquadMemberResponse> members = squadMemberRepository.findBySquadId(squadId).stream()
                .map(sm -> new SquadMemberResponse(
                        sm.getUser().getId(),
                        sm.getRole(),
                        sm.getUser().getUsername(),
                        sm.getUser().getDisplayName(),
                        sm.getUser().getAvatarUrl(),
                        sm.getUser().getTotalScore()
                ))
                .collect(Collectors.toList());
        return new SquadDetailsResponse(squadToResponse(squad), members);
    }

    @Transactional
    public void leaveSquad(String squadId, String userId) {
        Squad squad = squadRepository.findById(squadId).orElseThrow(() -> new RuntimeException("Squad not found"));
        if (squad.getOwnerId().equals(userId)) {
            throw new RuntimeException("Owner cannot leave the squad. Transfer ownership or delete squad.");
        }
        SquadMemberId smId = new SquadMemberId();
        smId.setSquadId(squadId);
        smId.setUserId(userId);
        squadMemberRepository.deleteById(smId);
    }

    @Transactional
    public void deleteSquad(String squadId, String userId) {
        Squad squad = squadRepository.findById(squadId).orElseThrow(() -> new RuntimeException("Squad not found"));
        if (!squad.getOwnerId().equals(userId)) {
            throw new RuntimeException("Only the owner can delete the squad");
        }
        squadMemberRepository.deleteBySquadId(squadId);
        squadRepository.delete(squad);
    }

    @Transactional
    public SquadResponse updateSquad(String squadId, String userId, String name, String description, String imageUrl) {
        Squad squad = squadRepository.findById(squadId).orElseThrow(() -> new RuntimeException("Squad not found"));
        if (!squad.getOwnerId().equals(userId)) {
            throw new RuntimeException("Only the owner can update the squad");
        }
        if (name != null) squad.setName(name);
        if (description != null) squad.setDescription(description);
        if (imageUrl != null) squad.setImageUrl(imageUrl);
        squad = squadRepository.save(squad);
        return squadToResponse(squad);
    }

    private void addMemberToSquad(Squad squad, String userId, String role) {
        User user = userRepository.findById(userId).orElseThrow();
        SquadMember sm = new SquadMember();
        SquadMemberId smId = new SquadMemberId();
        smId.setSquadId(squad.getId());
        smId.setUserId(userId);
        sm.setId(smId);
        sm.setSquad(squad);
        sm.setUser(user);
        sm.setRole(role);
        squadMemberRepository.save(sm);
    }

    private SquadResponse squadToResponse(Squad squad) {
        int count = (int) squadMemberRepository.countBySquadId(squad.getId());
        return new SquadResponse(
                squad.getId(),
                squad.getName(),
                squad.getDescription(),
                squad.getImageUrl(),
                squad.getInviteCode(),
                squad.getOwnerId(),
                squad.getMaxMembers(),
                count
        );
    }

    public record SquadResponse(String id, String name, String description, String imageUrl, String inviteCode, String ownerId, int maxMembers, int memberCount) {}
    public record SquadMemberResponse(String userId, String role, String username, String displayName, String avatarUrl, int totalScore) {}
    public record SquadDetailsResponse(SquadResponse squad, List<SquadMemberResponse> members) {}
}
