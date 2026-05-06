package com.devrats.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.JoinColumn;
import java.time.Instant;

@Entity
@Table(name = "squad_members")
public class SquadMember {

    @EmbeddedId
    private SquadMemberId id;

    @ManyToOne
    @MapsId("squadId")
    @JoinColumn(name = "squad_id")
    private Squad squad;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 20, nullable = false)
    private String role = "member";

    @Column(name = "joined_at", nullable = false, updatable = false)
    private Instant joinedAt = Instant.now();

    public SquadMemberId getId() { return id; }
    public void setId(SquadMemberId id) { this.id = id; }

    public Squad getSquad() { return squad; }
    public void setSquad(Squad squad) { this.squad = squad; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public Instant getJoinedAt() { return joinedAt; }
    public void setJoinedAt(Instant joinedAt) { this.joinedAt = joinedAt; }
}
