package com.devrats.service;

import com.devrats.model.Squad;
import com.devrats.model.SquadMember;
import com.devrats.model.User;
import com.devrats.repository.SquadMemberRepository;
import com.devrats.repository.SquadRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for SquadService.
 *
 * Per spec section 5: "O coração da retenção do aplicativo é o formato de grupos."
 * - Users can create squads and generate invite links/codes
 * - Individual scoring feeds the squad's collective score
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Squad Service - Squad Management")
class SquadServiceTest {

    @Mock
    private SquadRepository squadRepository;

    @Mock
    private SquadMemberRepository squadMemberRepository;

    @InjectMocks
    private SquadService squadService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setGithubUsername("testuser");
    }

    @Test
    @DisplayName("Should create a squad with a unique invite code")
    void shouldCreateSquadWithInviteCode() {
        String squadName = "Test Squad";

        when(squadRepository.save(any(Squad.class))).thenAnswer(invocation -> {
            Squad saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        Squad squad = squadService.createSquad(squadName, testUser);

        assertNotNull(squad, "Created squad must not be null");
        assertEquals(squadName, squad.getName(), "Squad name must match");
        assertNotNull(squad.getInviteCode(), "Squad must have an invite code");
        assertFalse(squad.getInviteCode().isBlank(), "Invite code must not be blank");
    }

    @Test
    @DisplayName("Should allow a user to join a squad by invite code")
    void shouldJoinSquadByInviteCode() {
        String inviteCode = "ABCD1234";
        Squad existingSquad = new Squad();
        existingSquad.setId(1L);
        existingSquad.setName("Existing Squad");
        existingSquad.setInviteCode(inviteCode);

        when(squadRepository.findByInviteCode(inviteCode)).thenReturn(Optional.of(existingSquad));
        when(squadMemberRepository.existsByUserIdAndSquadId(testUser.getId(), existingSquad.getId()))
                .thenReturn(false);

        assertDoesNotThrow(() -> squadService.joinSquad(inviteCode, testUser),
                "User should be able to join a squad with a valid invite code");

        verify(squadMemberRepository).save(any(SquadMember.class));
    }

    @Test
    @DisplayName("Should reject joining with invalid invite code")
    void shouldRejectInvalidInviteCode() {
        String invalidCode = "INVALID_CODE";

        when(squadRepository.findByInviteCode(invalidCode)).thenReturn(Optional.empty());

        assertThrows(Exception.class,
                () -> squadService.joinSquad(invalidCode, testUser),
                "Joining with an invalid invite code must throw an exception");
    }

    @Test
    @DisplayName("Should prevent duplicate squad membership")
    void shouldPreventDuplicateMembership() {
        String inviteCode = "ABCD1234";
        Squad existingSquad = new Squad();
        existingSquad.setId(1L);
        existingSquad.setInviteCode(inviteCode);

        when(squadRepository.findByInviteCode(inviteCode)).thenReturn(Optional.of(existingSquad));
        when(squadMemberRepository.existsByUserIdAndSquadId(testUser.getId(), existingSquad.getId()))
                .thenReturn(true);

        assertThrows(Exception.class,
                () -> squadService.joinSquad(inviteCode, testUser),
                "Joining a squad the user is already in must throw an exception");
    }

    @Test
    @DisplayName("Should list squads for a user")
    void shouldListUserSquads() {
        Squad squad1 = new Squad();
        squad1.setId(1L);
        squad1.setName("Squad Alpha");

        Squad squad2 = new Squad();
        squad2.setId(2L);
        squad2.setName("Squad Beta");

        when(squadMemberRepository.findSquadsByUserId(testUser.getId()))
                .thenReturn(List.of(squad1, squad2));

        List<Squad> squads = squadService.getUserSquads(testUser.getId());

        assertEquals(2, squads.size(), "User should be member of 2 squads");
    }
}
