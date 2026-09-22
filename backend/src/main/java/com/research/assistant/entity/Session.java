package com.research.assistant.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "sessions")
@Data
@NoArgsConstructor
public class Session {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "session_name", nullable = false)
    private String sessionName;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "last_active")
    private LocalDateTime lastActive;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastActive = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        lastActive = LocalDateTime.now();
    }
}
