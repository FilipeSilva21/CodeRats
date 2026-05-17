package com.devrats.service;

import com.devrats.model.RefreshToken;
import com.devrats.model.User;
import com.devrats.model.Squad;
import com.devrats.repository.RefreshTokenRepository;
import com.devrats.repository.UserRepository;
import com.devrats.repository.ScoreRepository;
import com.devrats.repository.NotificationRepository;
import com.devrats.repository.SquadMemberRepository;
import com.devrats.repository.SquadRepository;
import com.devrats.security.JwtProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProvider jwtProvider;
    private final LeagueService leagueService;
    private final ScoreRepository scoreRepository;
    private final NotificationRepository notificationRepository;
    private final SquadMemberRepository squadMemberRepository;
    private final SquadRepository squadRepository;

    public AuthService(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository, JwtProvider jwtProvider, LeagueService leagueService, ScoreRepository scoreRepository, NotificationRepository notificationRepository, SquadMemberRepository squadMemberRepository, SquadRepository squadRepository) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtProvider = jwtProvider;
        this.leagueService = leagueService;
        this.scoreRepository = scoreRepository;
        this.notificationRepository = notificationRepository;
        this.squadMemberRepository = squadMemberRepository;
        this.squadRepository = squadRepository;
    }

    @Transactional
    public void deleteAccount(String userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        
        // 1. Soft delete the user
        user.setDeletedAt(Instant.now());
        userRepository.save(user);

        // 2. Delete refresh tokens to force immediate logout across all devices
        refreshTokenRepository.deleteByUserId(userId);
    }

    @Transactional
    public AuthResponse findOrCreateUser(String githubId, String username, String displayName, String avatarUrl, String email) {
        User user = userRepository.findByGithubId(githubId);
        if (user == null) {
            user = new User();
            user.setId(UUID.randomUUID().toString());
            user.setGithubId(githubId);
            user.setUsername(username);
            user.setDisplayName(displayName);
            user.setAvatarUrl(avatarUrl);
            user.setEmail(email);
            user = userRepository.save(user);
        } else if (user.getDeletedAt() != null) {
            // Restore soft-deleted account
            user.setDeletedAt(null);
            user = userRepository.save(user);
        }

        leagueService.assignUserToGroup(user);

        String accessToken = jwtProvider.generateAccessToken(user.getId());
        String refreshToken = jwtProvider.generateRefreshToken(user.getId());

        RefreshToken rt = new RefreshToken();
        rt.setId(UUID.randomUUID().toString());
        rt.setUserId(user.getId());
        rt.setToken(refreshToken);
        rt.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        refreshTokenRepository.save(rt);

        return new AuthResponse(
                accessToken,
                refreshToken,
                new UserProfile(
                        user.getId(),
                        user.getUsername(),
                        user.getDisplayName(),
                        user.getAvatarUrl(),
                        user.getTotalScore(),
                        user.getEffectiveStreak(),
                        user.getBestStreak(),
                        user.getLeague()
                )
        );
    }

    @Transactional
    public TokenRefreshResponse refreshAccessToken(String token) {
        RefreshToken stored = refreshTokenRepository.findByToken(token);
        if (stored == null || stored.getExpiresAt().isBefore(Instant.now())) {
            return null;
        }
        String userId = stored.getUserId();
        
        // Check if user is soft-deleted
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getDeletedAt() != null) {
            refreshTokenRepository.delete(stored);
            return null;
        }
        
        refreshTokenRepository.delete(stored);

        String newAccess = jwtProvider.generateAccessToken(userId);
        String newRefresh = jwtProvider.generateRefreshToken(userId);

        RefreshToken rt = new RefreshToken();
        rt.setId(UUID.randomUUID().toString());
        rt.setUserId(userId);
        rt.setToken(newRefresh);
        rt.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        refreshTokenRepository.save(rt);

        return new TokenRefreshResponse(newAccess, newRefresh);
    }

    public UserProfile getProfile(String userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getDeletedAt() != null) {
            return null;
        }
        return new UserProfile(
                user.getId(),
                user.getUsername(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                user.getTotalScore(),
                user.getEffectiveStreak(),
                user.getBestStreak(),
                user.getLeague()
        );
    }

    public record AuthResponse(String accessToken, String refreshToken, UserProfile user) {}
    public record TokenRefreshResponse(String accessToken, String refreshToken) {}
    public record UserProfile(String id, String username, String displayName, String avatarUrl, Integer totalScore, Integer currentStreak, Integer bestStreak, String league) {}
}
