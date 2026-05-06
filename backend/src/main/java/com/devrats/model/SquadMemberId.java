package com.devrats.model;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class SquadMemberId implements Serializable {
    private String squadId;
    private String userId;

    public SquadMemberId() {}

    public SquadMemberId(String squadId, String userId) {
        this.squadId = squadId;
        this.userId = userId;
    }

    public String getSquadId() { return squadId; }
    public void setSquadId(String squadId) { this.squadId = squadId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SquadMemberId that = (SquadMemberId) o;
        return Objects.equals(squadId, that.squadId) &&
               Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(squadId, userId);
    }
}
