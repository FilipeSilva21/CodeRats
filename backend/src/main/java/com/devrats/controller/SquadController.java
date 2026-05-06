package com.devrats.controller;

import com.devrats.service.SquadService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/squads")
public class SquadController {
    private final SquadService squadService;

    public SquadController(SquadService squadService) {
        this.squadService = squadService;
    }

    private String getUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        return (String) auth.getPrincipal();
    }

    @PostMapping
    public ResponseEntity<SquadService.SquadResponse> create(@RequestBody Map<String, String> body) {
        String userId = getUserId();
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        String name = body.get("name");
        if (name == null || name.isBlank()) return ResponseEntity.badRequest().build();
        
        return ResponseEntity.ok(squadService.create(name, userId));
    }

    @PostMapping("/join")
    public ResponseEntity<?> join(@RequestBody Map<String, String> body) {
        String userId = getUserId();
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        String inviteCode = body.get("inviteCode");
        if (inviteCode == null || inviteCode.isBlank()) return ResponseEntity.badRequest().body(Map.of("error", "Missing inviteCode"));
        
        try {
            return ResponseEntity.ok(squadService.joinByCode(inviteCode, userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<List<SquadService.SquadResponse>> mySquads() {
        String userId = getUserId();
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(squadService.getMySquads(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDetails(@PathVariable String id) {
        try {
            return ResponseEntity.ok(squadService.getDetails(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<?> leaveSquad(@PathVariable String id) {
        String userId = getUserId();
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        try {
            squadService.leaveSquad(id, userId);
            return ResponseEntity.ok(Map.of("status", "ok"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSquad(@PathVariable String id, @RequestBody Map<String, String> body) {
        String userId = getUserId();
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        try {
            return ResponseEntity.ok(squadService.updateSquad(id, userId, body.get("name"), body.get("description"), body.get("imageUrl")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
