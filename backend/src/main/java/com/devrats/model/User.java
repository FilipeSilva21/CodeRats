package com.devrats.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "users")
public class User {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "github_id", length = 50, unique = true, nullable = false)
    private String githubId;

    @Column(length = 100, nullable = false)
    private String username;

    @Column(name = "display_name", length = 200, nullable = false)
    private String displayName;

    @Column(length = 255)
    private String email;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "total_score", nullable = false)
    private Integer totalScore = 0;

    @Column(name = "current_streak", nullable = false)
    private Integer currentStreak = 0;

    @Column(name = "best_streak", nullable = false)
    private Integer bestStreak = 0;

    @Column(name = "last_commit_date", length = 20)
    private String lastCommitDate;

    @Column(length = 20, nullable = false)
    private String league = "BRONZE";

    @Column(name = "active_league_group_id", length = 36)
    private String activeLeagueGroupId;

    @Column(name = "notif_push_enabled")
    private Boolean notifPushEnabled = true;

    @Column(name = "notif_email_weekly")
    private Boolean notifEmailWeekly = false;

    @Column(name = "notif_squad_alerts")
    private Boolean notifSquadAlerts = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "deleted_at")
    private Instant deletedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getGithubId() { return githubId; }
    public void setGithubId(String githubId) { this.githubId = githubId; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    
    public Integer getTotalScore() { return totalScore; }
    public void setTotalScore(Integer totalScore) { this.totalScore = totalScore; }
    
    public Integer getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(Integer currentStreak) { this.currentStreak = currentStreak; }
    
    public Integer getBestStreak() { return bestStreak; }
    public void setBestStreak(Integer bestStreak) { this.bestStreak = bestStreak; }
    
    public String getLastCommitDate() { return lastCommitDate; }
    public void setLastCommitDate(String lastCommitDate) { this.lastCommitDate = lastCommitDate; }
    
    public String getLeague() { return league; }
    public void setLeague(String league) { this.league = league; }
    
    public String getActiveLeagueGroupId() { return activeLeagueGroupId; }
    public void setActiveLeagueGroupId(String activeLeagueGroupId) { this.activeLeagueGroupId = activeLeagueGroupId; }

    public Boolean getNotifPushEnabled() { return notifPushEnabled != null ? notifPushEnabled : true; }
    public void setNotifPushEnabled(Boolean notifPushEnabled) { this.notifPushEnabled = notifPushEnabled; }

    public Boolean getNotifEmailWeekly() { return notifEmailWeekly != null ? notifEmailWeekly : false; }
    public void setNotifEmailWeekly(Boolean notifEmailWeekly) { this.notifEmailWeekly = notifEmailWeekly; }

    public Boolean getNotifSquadAlerts() { return notifSquadAlerts != null ? notifSquadAlerts : true; }
    public void setNotifSquadAlerts(Boolean notifSquadAlerts) { this.notifSquadAlerts = notifSquadAlerts; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getDeletedAt() { return deletedAt; }
    public void setDeletedAt(Instant deletedAt) { this.deletedAt = deletedAt; }

    public int getEffectiveStreak() {
        if (currentStreak == null || currentStreak == 0) return 0;
        if (lastCommitDate == null) return 0;
        
        LocalDate today = LocalDate.now();
        LocalDate lastDate = LocalDate.parse(lastCommitDate);
        long daysBetween = ChronoUnit.DAYS.between(lastDate, today);
        
        return daysBetween <= 1 ? currentStreak : 0;
    }
}
